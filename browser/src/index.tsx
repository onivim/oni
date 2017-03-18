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

    overlayManager.on("current-window-size-changed", (dimensionsInPixels: Rectangle) => UI.setActiveWindowDimensionsChanged(dimensionsInPixels))

    pluginManager.on("signature-help-response", (err: string, signatureHelp: any) => { // FIXME: setup Oni import
        if (err) {
            UI.hideSignatureHelp()
        } else {
            UI.showSignatureHelp(signatureHelp)
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
            UI.hideCompletions()
            UI.hidePopupMenu()
            UI.hideSignatureHelp()
            UI.hideQuickInfo()
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

        UI.setColors(screen.foregroundColor)

        if (!pendingTimeout) {
            pendingTimeout = setTimeout(updateFunction, 0) as any // FIXME: null
        }
    })

    instance.on("mode-change", (newMode: string) => {
        UI.setMode(newMode)

        if (newMode === "normal") {
            if (cursorLine) { // TODO: Add "unhide" i.e. only show if previously visible
                UI.showCursorLine()
            }
            if (cursorColumn) {
                UI.showCursorColumn()
            }
            UI.hideCompletions()
            UI.hideSignatureHelp()
        } else if (newMode === "insert") {
            UI.hideQuickInfo()
            if (cursorLine) { // TODO: Add "unhide" i.e. only show if previously visible
                UI.showCursorLine()
            }
            if (cursorColumn) {
                UI.showCursorColumn()
            }
        } else if (newMode === "cmdline") {
            UI.hideCursorColumn() // TODO: cleaner way to hide and unhide?
            UI.hideCursorLine()
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

    const config = Config.instance()

    const configChange = () => {
        cursorLine = config.getValue<boolean>("editor.cursorLine")
        cursorColumn = config.getValue<boolean>("editor.cursorColumn")
        UI.setCursorLineOpacity(config.getValue<number>("editor.cursorLineOpacity"))
        UI.setCursorColumnOpacity(config.getValue<number>("editor.cursorColumnOpacity"))

        if (cursorLine) {
            UI.showCursorLine()
        }

        if (cursorColumn) {
            UI.showCursorColumn()
        }

        remote.getCurrentWindow().setFullScreen(config.getValue<boolean>("editor.fullScreenOnStart"))
        instance.setFont(config.getValue<string>("editor.fontFamily"), config.getValue<string>("editor.fontSize"))
        updateFunction()
    }
    configChange() // initialize values
    config.registerListener(configChange)

    instance.start(parsedArgs._)

    const mouse = new Mouse(editorElement, screen)

    mouse.on("mouse", (mouseInput: string) => {
        UI.hideCompletions()
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
                autoCompletion.complete()
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

    window["neovim"] = instance // tslint:disable-line no-string-literal

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
