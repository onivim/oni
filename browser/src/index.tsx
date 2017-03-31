/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

/// <reference path="./../../definitions/Oni.d.ts" />

import { ipcRenderer, remote } from "electron"
import * as minimist from "minimist"
import * as path from "path"
import * as Config from "./Config"
import { IncrementalDeltaRegionTracker } from "./DeltaRegionTracker"
import { Keyboard } from "./Input/Keyboard"
import { Mouse } from "./Input/Mouse"
import { NeovimInstance } from "./NeovimInstance"
import { PluginManager } from "./Plugins/PluginManager"
import { DOMRenderer } from "./Renderer/DOMRenderer"
import { NeovimScreen } from "./Screen"

import { AutoCompletion } from "./Services/AutoCompletion"
import { BufferUpdates } from "./Services/BufferUpdates"
import { CommandManager } from "./Services/CommandManager"
import { registerBuiltInCommands } from "./Services/Commands"
import { Errors } from "./Services/Errors"
import { Formatter } from "./Services/Formatter"
import { LiveEvaluation } from "./Services/LiveEvaluation"
import { MultiProcess } from "./Services/MultiProcess"
import { OutputWindow } from "./Services/Output"
import { QuickOpen } from "./Services/QuickOpen"
import { SyntaxHighlighter } from "./Services/SyntaxHighlighter"
import { Tasks } from "./Services/Tasks"
import { WindowTitle } from "./Services/WindowTitle"

import * as UI from "./UI/index"
import { ErrorOverlay } from "./UI/Overlay/ErrorOverlay"
import { LiveEvaluationOverlay } from "./UI/Overlay/LiveEvaluationOverlay"
import { OverlayManager } from "./UI/Overlay/OverlayManager"
import { ScrollBarOverlay } from "./UI/Overlay/ScrollBarOverlay"
import { Rectangle } from "./UI/Types"

const start = (args: string[]) => {
    const services: any[] = []

    const parsedArgs = minimist(args)

    let cursorLine: boolean
    let cursorColumn: boolean
    let loadInitVim: boolean = false

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal
    require("./overlay.less")

    let deltaRegion = new IncrementalDeltaRegionTracker()
    let screen = new NeovimScreen(deltaRegion)

    const commandManager = new CommandManager()
    const pluginManager = new PluginManager(commandManager)
    let instance = new NeovimInstance(pluginManager, document.body.offsetWidth, document.body.offsetHeight)

    const editorElement = document.getElementById("oni-text-editor") as HTMLDivElement
    let renderer = new DOMRenderer()
    renderer.start(editorElement)

    let pendingTimeout: any = null

    // Services
    const autoCompletion = new AutoCompletion(instance)
    const bufferUpdates = new BufferUpdates(instance, pluginManager)
    const errorService = new Errors(instance)
    const quickOpen = new QuickOpen(instance)
    const windowTitle = new WindowTitle(instance)
    const multiProcess = new MultiProcess()
    const formatter = new Formatter(instance, pluginManager, bufferUpdates)
    const outputWindow = new OutputWindow(instance, pluginManager)
    const liveEvaluation = new LiveEvaluation(instance, pluginManager)
    const syntaxHighlighter = new SyntaxHighlighter(instance, pluginManager)
    const tasks = new Tasks(outputWindow)
    registerBuiltInCommands(commandManager, pluginManager, instance)

    tasks.registerTaskProvider(commandManager)
    tasks.registerTaskProvider(errorService)

    services.push(autoCompletion)
    services.push(bufferUpdates)
    services.push(errorService)
    services.push(quickOpen)
    services.push(windowTitle)
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

    overlayManager.on("current-window-size-changed", (dimensionsInPixels: Rectangle) => UI.Actions.setActiveWindowDimensionsChanged(dimensionsInPixels))

    pluginManager.on("signature-help-response", (err: string, signatureHelp: any) => { // FIXME: setup Oni import
        if (err) {
            UI.Actions.hideSignatureHelp()
        } else {
            UI.Actions.showSignatureHelp(signatureHelp)
        }
    })

    pluginManager.on("set-errors", (key: string, fileName: string, errors: any[], color: string) => {
        errorService.setErrors(fileName, errors)

        color = color || "red"
        errorOverlay.setErrors(key, fileName, errors, color)

        const errorMarkers = errors.map((e: any) => ({
            line: e.lineNumber,
            height: 1,
            color,
        }))
        scrollbarOverlay.setMarkers(path.resolve(fileName), key, errorMarkers)
    })

    liveEvaluation.on("evaluate-block-result", (file: string, blocks: any[]) => {
        liveEvaluationOverlay.setLiveEvaluationResult(file, blocks)
    })

    pluginManager.on("find-all-references", (references: Oni.Plugin.ReferencesResult) => {
        const convertToQuickFixItem = (item: Oni.Plugin.ReferencesResultItem) => ({
            filename: item.fullPath,
            lnum: item.line,
            col: item.column,
            text: item.lineText,
        })

        const quickFixItems = references.items.map((item) => convertToQuickFixItem(item))

        instance.quickFix.setqflist(quickFixItems, ` Find All References: ${references.tokenName}`)
        instance.command("copen")
        instance.command(`execute "normal! /${references.tokenName}\\<cr>"`)
    })

    instance.on("event", (eventName: string, evt: any) => {
        // TODO: Can we get rid of these?
        errorOverlay.onVimEvent(eventName, evt)
        liveEvaluationOverlay.onVimEvent(eventName, evt)
        scrollbarOverlay.onVimEvent(eventName, evt)

        tasks.onEvent(evt)

        if (eventName === "BufEnter") {
            // TODO: More convenient way to hide all UI?
            UI.Actions.hideCompletions()
            UI.Actions.hidePopupMenu()
            UI.Actions.hideSignatureHelp()
            UI.Actions.hideQuickInfo()
        }

        if (eventName === "DirChanged") {
            instance.getCurrentWorkingDirectory()
                .then((newDirectory) => process.chdir(newDirectory))
        }
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

        UI.Actions.setColors(screen.foregroundColor)

        if (!pendingTimeout) {
            pendingTimeout = setTimeout(updateFunction, 0) as any // FIXME: null
        }
    })

    instance.on("mode-change", (newMode: string) => {
        UI.Actions.setMode(newMode)

        if (newMode === "normal") {
            if (cursorLine) { // TODO: Add "unhide" i.e. only show if previously visible
                UI.Actions.showCursorLine()
            }
            if (cursorColumn) {
                UI.Actions.showCursorColumn()
            }
            UI.Actions.hideCompletions()
            UI.Actions.hideSignatureHelp()
        } else if (newMode === "insert") {
            UI.Actions.hideQuickInfo()
            if (cursorLine) { // TODO: Add "unhide" i.e. only show if previously visible
                UI.Actions.showCursorLine()
            }
            if (cursorColumn) {
                UI.Actions.showCursorColumn()
            }
        } else if (newMode === "cmdline") {
            UI.Actions.hideCursorColumn() // TODO: cleaner way to hide and unhide?
            UI.Actions.hideCursorLine()
            UI.Actions.hideCompletions()
            UI.Actions.hideQuickInfo()

        }
    })

    const renderFunction = () => {
        if (pendingTimeout) {
            UI.Actions.setCursorPosition(screen)
        }

        renderer.update(screen, deltaRegion)

        deltaRegion.cleanUpRenderedCells()

        window.requestAnimationFrame(() => renderFunction())
    }

    renderFunction()

    const updateFunction = () => {
        // TODO: Move cursor to component
        UI.Actions.setCursorPosition(screen)

        UI.setBackgroundColor(screen.backgroundColor)

        clearTimeout(pendingTimeout as any) // FIXME: null
        pendingTimeout = null
    }

    const config = Config.instance()

    const configChange = () => {
        cursorLine = config.getValue<boolean>("editor.cursorLine")
        cursorColumn = config.getValue<boolean>("editor.cursorColumn")
        UI.Actions.setCursorLineOpacity(config.getValue<number>("editor.cursorLineOpacity"))
        UI.Actions.setCursorColumnOpacity(config.getValue<number>("editor.cursorColumnOpacity"))

        if (cursorLine) {
            UI.Actions.showCursorLine()
        }

        if (cursorColumn) {
            UI.Actions.showCursorColumn()
        }

        const window = remote.getCurrentWindow()
        const hideMenu: boolean = config.getValue<boolean>("oni.hideMenu")
        window.setAutoHideMenuBar(hideMenu)
        window.setMenuBarVisibility(!hideMenu)

        const loadInit: boolean = config.getValue<boolean>("oni.loadInitVim")
        if (loadInit !== loadInitVim) {
            ipcRenderer.send("rebuild-menu", loadInit)
            // don't rebuild menu unless oni.loadInitVim actually changed
            loadInitVim = loadInit
        }

        window.setFullScreen(config.getValue<boolean>("editor.fullScreenOnStart"))
        instance.setFont(config.getValue<string>("editor.fontFamily"), config.getValue<string>("editor.fontSize"))
        updateFunction()
    }
    configChange() // initialize values
    config.registerListener(configChange)

    instance.start(parsedArgs._)

    const mouse = new Mouse(editorElement, screen)

    mouse.on("mouse", (mouseInput: string) => {
        UI.Actions.hideCompletions()
        instance.input(mouseInput)
    })

    const keyboard = new Keyboard()
    keyboard.on("keydown", (key: string) => {

        if (key === "<f3>") {
            formatter.formatBuffer()
            return
        }

        if (UI.Selectors.isPopupMenuOpen()) {
            if (key === "<esc>") {
                UI.Actions.hidePopupMenu()
            } else if (key === "<enter>") {
                UI.Actions.selectMenuItem(false)
            } else if (key === "<C-v>") {
                UI.Actions.selectMenuItem(true)
            } else if (key === "<C-n>") {
                UI.Actions.nextMenuItem()
            } else if (key === "<C-p>") {
                UI.Actions.previousMenuItem()
            }

            return
        }

        if (UI.Selectors.areCompletionsVisible()) {

            if (key === "<enter>") {
                autoCompletion.complete()
                return
            } else if (key === "<C-n>") {
                UI.Actions.nextCompletion()
                return
            } else if (key === "<C-p>") {
                UI.Actions.previousCompletion()
                return
            }
        }

        if (key === "<f12>") {
            commandManager.executeCommand("oni.editor.gotoDefinition", null)
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

    window["__neovim"] = instance // tslint:disable-line no-string-literal
    window["__screen"] = screen // tslint:disable-line no-string-literal

    UI.init()

    ipcRenderer.on("menu-item-click", (_evt, message: string) => {
        if (message.startsWith(":")) {
            instance.command("exec \"" + message + "\"")
        } else {
            instance.command("exec \":normal! " + message + "\"")
        }
    })

    ipcRenderer.on("execute-command", (_evt, command: string) => {
        commandManager.executeCommand(command, null)
    })
}

ipcRenderer.on("init", (_evt, message) => {
    process.chdir(message.workingDirectory)
    start(message.args)
})
