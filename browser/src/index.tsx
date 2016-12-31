import { ipcRenderer } from "electron"
import * as minimist from "minimist"
import * as path from "path"
import * as Config from "./Config"
import { IncrementalDeltaRegionTracker } from "./DeltaRegionTracker"
import { Keyboard } from "./Input/Keyboard"
import { Mouse } from "./Input/Mouse"
import { NeovimInstance } from "./NeovimInstance"
import { PluginManager } from "./Plugins/PluginManager"
import { CanvasRenderer } from "./Renderer/CanvasRenderer"
import { NeovimScreen } from "./Screen"
import { Formatter } from "./Services/Formatter"
import { LiveEvaluation } from "./Services/LiveEvaluation"
import { MultiProcess } from "./Services/MultiProcess"
import { OutputWindow } from "./Services/Output"
import { QuickOpen } from "./Services/QuickOpen"
import { Tasks } from "./Services/Tasks"
import { SyntaxHighlighter } from "./Services/SyntaxHighlighter"
import * as UI from "./UI/index"
import { ErrorOverlay } from "./UI/Overlay/ErrorOverlay"
import { LiveEvaluationOverlay } from "./UI/Overlay/LiveEvaluationOverlay"
import { ScrollBarOverlay } from "./UI/Overlay/ScrollBarOverlay"
import { OverlayManager } from "./UI/Overlay/OverlayManager"

const start = (args: string[]) => {
    const services: any[] = []

    const parsedArgs = minimist(args)
    const debugPlugin = parsedArgs["debugPlugin"] // tslint:disable-line no-string-literal

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal

    require("./overlay.less")

    let deltaRegion = new IncrementalDeltaRegionTracker()
    let screen = new NeovimScreen(deltaRegion)

    const pluginManager = new PluginManager(screen, debugPlugin)
    let instance = new NeovimInstance(pluginManager, document.body.offsetWidth, document.body.offsetHeight)

    const canvasElement = document.getElementById("test-canvas") as HTMLCanvasElement
    let renderer = new CanvasRenderer()
    renderer.start(canvasElement)

    let pendingTimeout: any = null

    // Services
    const quickOpen = new QuickOpen(instance)
    const multiProcess = new MultiProcess()
    const formatter = new Formatter(instance, pluginManager)
    const outputWindow = new OutputWindow(instance, pluginManager)
    const liveEvaluation = new LiveEvaluation(instance, pluginManager)
    const syntaxHighlighter = new SyntaxHighlighter(instance, pluginManager)
    const tasks = new Tasks(outputWindow)

    services.push(quickOpen)
    services.push(tasks)
    services.push(formatter)
    services.push(liveEvaluation)
    services.push(multiProcess)
    services.push(syntaxHighlighter)
    services.push(outputWindow)

    // Overlays
    const overlayManager = new OverlayManager(screen, instance)
    const errorOverlay = new ErrorOverlay()
    const liveEvaluationOverlay = new LiveEvaluationOverlay()
    const scrollbarOverlay = new ScrollBarOverlay()
    overlayManager.addOverlay("errors", errorOverlay)
    overlayManager.addOverlay("live-eval", liveEvaluationOverlay)
    overlayManager.addOverlay("scrollbar", scrollbarOverlay)

    pluginManager.on("signature-help-response", (err: string, signatureHelp: any) => { // FIXME: setup Oni import
        if (err) {
            UI.hideSignatureHelp()
        } else {
            UI.showSignatureHelp(signatureHelp)
        }
    })

    pluginManager.on("set-errors", (key: string, fileName: string, errors: any[], color: string) => {
        color = color || "red"
        errorOverlay.setErrors(key, fileName, errors, color)

        const errorMarkers = errors.map((e: any) => ({
            line: e.lineNumber,
            height: 1,
            color: color,
        }))
        scrollbarOverlay.setMarkers(path.resolve(fileName), key, errorMarkers)
    })

    liveEvaluation.on("evaluate-block-result", (file: string, blocks: any[]) => {
        liveEvaluationOverlay.setLiveEvaluationResult(file, blocks)
    })

    instance.on("event", (eventName: string, evt: any) => {
        // TODO: Can we get rid of these?
        errorOverlay.onVimEvent(eventName, evt)
        liveEvaluationOverlay.onVimEvent(eventName, evt)
        scrollbarOverlay.onVimEvent(eventName, evt)

        tasks.onEvent(evt)

        if (eventName === "BufEnter") {
            // TODO: More convenient way to hide all UI?
            UI.hideCompletions()
            UI.hidePopupMenu()
            UI.hideSignatureHelp()
            UI.hideQuickInfo()
        }
    })

    instance.on("show-popup-menu", (completions: any[]) => {
        const c = completions.map(c => ({
            "kind": "text",
            "label": c[0],
        }))

        UI.showCompletions({
            base: "",
            completions: c
        })
    })

    instance.on("error", (_err: string) => {
        UI.showNeovimInstallHelp()
    })

    instance.on("buffer-update", (context: any, lines: string[]) => {
        scrollbarOverlay.onBufferUpdate(context, lines)
    })

    instance.on("window-display-update", (eventContext: Oni.EventContext, lineMapping: any) => {
        overlayManager.notifyWindowDimensionsChanged(eventContext, lineMapping)
    })

    instance.on("action", (action: any) => {
        renderer.onAction(action)
        screen.dispatch(action)

        UI.setColors(screen.foregroundColor)

        if (!pendingTimeout) {
            pendingTimeout = setTimeout(updateFunction, 0) as any // FIXME: null
        }
    })

    instance.on("mode-change", (newMode: string) => {
        UI.setMode(newMode)

        if (newMode === "normal") {
            UI.hideCompletions()
            UI.hideSignatureHelp()
        } else if (newMode === "insert") {
            UI.hideQuickInfo()
        } else if (newMode === "cmdline") {
            UI.hideCompletions()
            UI.hideQuickInfo()

        }
    })

    const renderFunction = () => {
        if (pendingTimeout) {
            UI.setCursorPosition(screen)
        }

        renderer.update(screen, deltaRegion)
        deltaRegion.cleanUpRenderedCells()

        window.requestAnimationFrame(() => renderFunction())
    }

    renderFunction()

    const updateFunction = () => {
        // TODO: Move cursor to component
        UI.setCursorPosition(screen)

        UI.setBackgroundColor(screen.backgroundColor)

        clearTimeout(pendingTimeout as any) // FIXME: null
        pendingTimeout = null
    }

    instance.setFont(Config.getValue<string>("editor.fontFamily"), Config.getValue<string>("editor.fontSize"))
    instance.start(parsedArgs._)

    const mouse = new Mouse(canvasElement, screen)

    mouse.on("mouse", (mouseInput: string) => {
        instance.input(mouseInput)
    })

    const keyboard = new Keyboard()
    keyboard.on("keydown", (key: string) => {

        if (key === "<f3>") {
            formatter.formatBuffer()
            return
        }

        if (UI.isPopupMenuOpen()) {
            if (key === "<esc>") {
                UI.hidePopupMenu()
            } else if (key === "<enter>") {
                UI.selectPopupMenuItem(false)
            } else if (key === "<C-v>") {
                UI.selectPopupMenuItem(true)
            } else if (key === "<C-n>") {
                UI.nextPopupMenuItem()
            } else if (key === "<C-p>") {
                UI.previousPopupMenuItem()
            }

            return
        }

        if (UI.areCompletionsVisible()) {

            if (key === "<enter>") {
                let completion = UI.getSelectedCompletion() || ''

                //move one character left so the cursor is "within" the word
                //(we wouldn't be displaying completions if there wasn't at least one character)
                instance.input('<left>')
                //get current word under cursor
                instance.eval<string>("expand('<cword>')")
                    .then((word) => {
                        //move back to where we were
                        instance.input('<right>')
                        //remove the first instance of the word under the cursor
                        instance.input(completion.replace(word,''))
                    })

                UI.hideCompletions()
                return
            } else if (key === "<C-n>") {
                UI.nextCompletion()
                return

            } else if (key === "<C-p>") {
                UI.previousCompletion()
                return
            }
        }

        if (key === "<f12>") {
            pluginManager.executeCommand("editor.gotoDefinition")
        } else if (key === "<C-p>" && screen.mode === "normal") {
            quickOpen.show()
        } else if (key === "<C-P>" && screen.mode === "normal") {
            tasks.show()
        } else if (key === "<C-pageup>") {
            multiProcess.focusPreviousInstance()
        } else if (key === "<C-pagedown>") {
            multiProcess.focusNextInstance()
        } else {
            instance.input(key)
        }
    })

    UI.events.on("completion-item-selected", (item: any) => {
        pluginManager.notifyCompletionItemSelected(item)
    })

    const resize = () => {
        let width = document.body.offsetWidth
        let height = document.body.offsetHeight

        deltaRegion.dirtyAllCells()

        instance.resize(width, height)
        renderer.onResize()
    }
    window.addEventListener("resize", resize)

    window["neovim"] = instance // tslint:disable-line no-string-literal

    UI.init()
}

ipcRenderer.on("init", (_evt, message) => {
    process.chdir(message.workingDirectory)
    start(message.args)
})
