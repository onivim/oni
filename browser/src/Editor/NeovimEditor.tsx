/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"
import * as ReactDOM from "react-dom"

import * as types from "vscode-languageserver-types"

import { ipcRenderer } from "electron"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { CanvasRenderer, DOMRenderer, INeovimRenderer } from "./../Renderer"
import { NeovimScreen } from "./../Screen"

import * as Config from "./../Config"

import { PluginManager } from "./../Plugins/PluginManager"

import { AutoCompletion } from "./../Services/AutoCompletion"
import { BufferUpdates } from "./../Services/BufferUpdates"
import { CommandManager } from "./../Services/CommandManager"
import { registerBuiltInCommands } from "./../Services/Commands"
import { Errors } from "./../Services/Errors"
import { Formatter } from "./../Services/Formatter"
import { LiveEvaluation } from "./../Services/LiveEvaluation"
import { MultiProcess } from "./../Services/MultiProcess"
import { OutputWindow } from "./../Services/Output"
import { QuickOpen } from "./../Services/QuickOpen"
import { SyntaxHighlighter } from "./../Services/SyntaxHighlighter"
import { Tasks } from "./../Services/Tasks"
import { WindowTitle } from "./../Services/WindowTitle"

import * as UI from "./../UI/index"
import { LiveEvaluationOverlay } from "./../UI/Overlay/LiveEvaluationOverlay"
import { OverlayManager } from "./../UI/Overlay/OverlayManager"
import { Rectangle } from "./../UI/Types"

import { Keyboard } from "./../Input/Keyboard"
import { IEditor } from "./Editor"

import { InstallHelp } from "./../UI/components/InstallHelp"

import { NeovimSurface } from "./NeovimSurface"

export class NeovimEditor implements IEditor {

    private _neovimInstance: NeovimInstance
    private _deltaRegionManager: IncrementalDeltaRegionTracker
    private _renderer: INeovimRenderer
    private _screen: NeovimScreen

    private _pendingTimeout: any = null
    private _element: HTMLElement

    // Services
    private _tasks: Tasks

    // Overlays
    private _overlayManager: OverlayManager
    private _liveEvaluationOverlay: LiveEvaluationOverlay

    private _errorStartingNeovim: boolean = false

    constructor(
        private _commandManager: CommandManager,
        private _pluginManager: PluginManager,
        private _config: Config.Config = Config.instance(),
    ) {
        const services: any[] = []

        this._neovimInstance = new NeovimInstance(this._pluginManager, 100, 100)
        this._deltaRegionManager = new IncrementalDeltaRegionTracker()
        this._screen = new NeovimScreen(this._deltaRegionManager)

        this._renderer = this._config.getValue("editor.renderer") === "canvas" ? new CanvasRenderer() : new DOMRenderer()

        // Services
        const autoCompletion = new AutoCompletion(this._neovimInstance)
        const bufferUpdates = new BufferUpdates(this._neovimInstance, this._pluginManager)
        const errorService = new Errors(this._neovimInstance)
        const quickOpen = new QuickOpen(this._neovimInstance)
        const windowTitle = new WindowTitle(this._neovimInstance)
        const multiProcess = new MultiProcess()
        const formatter = new Formatter(this._neovimInstance, this._pluginManager, bufferUpdates)
        const liveEvaluation = new LiveEvaluation(this._neovimInstance, this._pluginManager)
        const syntaxHighlighter = new SyntaxHighlighter(this._neovimInstance, this._pluginManager)
        const outputWindow = new OutputWindow(this._neovimInstance, this._pluginManager)
        this._tasks = new Tasks(outputWindow)
        registerBuiltInCommands(this._commandManager, this._pluginManager, this._neovimInstance)

        this._tasks.registerTaskProvider(this._commandManager)
        this._tasks.registerTaskProvider(errorService)

        services.push(autoCompletion)
        services.push(bufferUpdates)
        services.push(errorService)
        services.push(quickOpen)
        services.push(windowTitle)
        services.push(formatter)
        services.push(liveEvaluation)
        services.push(multiProcess)
        services.push(syntaxHighlighter)
        services.push(outputWindow)

        // Overlays
        // TODO: Replace `OverlayManagement` concept and associated window management code with
        // explicit window management: #362
        this._overlayManager = new OverlayManager(this._screen, this._neovimInstance)
        this._liveEvaluationOverlay = new LiveEvaluationOverlay()
        this._overlayManager.addOverlay("live-eval", this._liveEvaluationOverlay)

        this._overlayManager.on("current-window-size-changed", (dimensionsInPixels: Rectangle, windowId: number) => {
            UI.Actions.setWindowDimensions(windowId, dimensionsInPixels)
        })

        // TODO: Refactor `pluginManager` responsibilities outside of this instance
        this._pluginManager.on("signature-help-response", (err: string, signatureHelp: any) => { // FIXME: setup Oni import
            if (err) {
                UI.Actions.hideSignatureHelp()
            } else {
                UI.Actions.showSignatureHelp(signatureHelp)
            }
        })

        this._pluginManager.on("set-errors", (key: string, fileName: string, errors: types.Diagnostic[]) => {

            UI.Actions.setErrors(fileName, key, errors)

            errorService.setErrors(fileName, errors)
        })

        liveEvaluation.on("evaluate-block-result", (file: string, blocks: any[]) => {
            this._liveEvaluationOverlay.setLiveEvaluationResult(file, blocks)
        })

        this._pluginManager.on("find-all-references", (references: Oni.Plugin.ReferencesResult) => {
            const convertToQuickFixItem = (item: Oni.Plugin.ReferencesResultItem) => ({
                filename: item.fullPath,
                lnum: item.line,
                col: item.column,
                text: item.lineText || references.tokenName,
            })

            const quickFixItems = references.items.map((item) => convertToQuickFixItem(item))

            this._neovimInstance.quickFix.setqflist(quickFixItems, ` Find All References: ${references.tokenName}`)
            this._neovimInstance.command("copen")
            this._neovimInstance.command(`execute "normal! /${references.tokenName}\\<cr>"`)
        })

        this._neovimInstance.on("event", (eventName: string, evt: any) => this._onVimEvent(eventName, evt))

        this._neovimInstance.on("error", (_err: string) => {
            this._errorStartingNeovim = true
            ReactDOM.render(<InstallHelp />, this._element.parentElement)
        })

        this._neovimInstance.on("window-display-update", (eventContext: Oni.EventContext, lineMapping: any, shouldMeasure: boolean) => {
            if (shouldMeasure) {
                this._overlayManager.notifyWindowDimensionsChanged(eventContext, lineMapping)
            }

            UI.Actions.setWindowLineMapping(eventContext.windowNumber, lineMapping)
        })

        this._neovimInstance.on("action", (action: any) => {
            this._renderer.onAction(action)
            this._screen.dispatch(action)

            UI.Actions.setColors(this._screen.foregroundColor, this._screen.backgroundColor)

            if (!this._pendingTimeout) {
                this._pendingTimeout = setTimeout(() => this._onUpdate(), 0)
            }
        })

        this._neovimInstance.on("logInfo", (info: string) => {
            UI.Actions.makeLog({
                type: "info",
                message: info,
                details: null,
            })
        })

        this._neovimInstance.on("logWarning", (warning: string) => {
            UI.Actions.makeLog({
                type: "warning",
                message: warning,
                details: null,
            })
        })

        this._neovimInstance.on("logError", (err: Error) => {
            UI.Actions.makeLog({
                type: "error",
                message: err.message,
                details: err.stack.split("\n"),
            })
        })

        this._neovimInstance.on("mode-change", (newMode: string) => this._onModeChanged(newMode))

        this._render()

        this._onConfigChanged()
        this._config.registerListener(() => this._onConfigChanged())

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
                this._commandManager.executeCommand("oni.editor.gotoDefinition", null)
            } else if (key === "<C-p>" && this._screen.mode === "normal") {
                quickOpen.show()
            } else if (key === "<C-P>" && this._screen.mode === "normal") {
                this._tasks.show()
            } else if (key === "<C-pageup>") {
                multiProcess.focusPreviousInstance()
            } else if (key === "<C-pagedown>") {
                multiProcess.focusNextInstance()
            } else {
                this._neovimInstance.input(key)
            }
        })

        window["__neovim"] = this._neovimInstance // tslint:disable-line no-string-literal
        window["__screen"] = screen // tslint:disable-line no-string-literal

        ipcRenderer.on("menu-item-click", (_evt: any, message: string) => {
            if (message.startsWith(":")) {
                this._neovimInstance.command("exec \"" + message + "\"")
            } else {
                this._neovimInstance.command("exec \":normal! " + message + "\"")
            }
        })

        const normalizePath = (fileName: string) => fileName.split("\\").join("/")

        const openFiles = async (files: string[], action: string) => {

            await this._neovimInstance.callFunction("OniOpenFile", [action, files[0]])

            for (let i = 1; i < files.length; i++) {
                this._neovimInstance.command("exec \"" + action + " " + normalizePath(files[i]) + "\"")
            }
        }

        ipcRenderer.on("open-files", (_evt: any, message: string, files: string[]) => {
            openFiles(files, message)
        })

        // enable opening a file via drag-drop
        document.ondragover = (ev) => {
            ev.preventDefault()
        }
        document.body.ondrop = (ev) => {
            ev.preventDefault()

            let files = ev.dataTransfer.files
            // open first file in current editor
            this._neovimInstance.open(normalizePath(files[0].path))
            // open any subsequent files in new tabs
            for (let i = 1; i < files.length; i++) {
                this._neovimInstance.command("exec \":tabe " + normalizePath(files.item(i).path) + "\"")
            }
        }
    }

    public init(filesToOpen: string[]): void {
        this._neovimInstance.start(filesToOpen)
    }

    public render(): JSX.Element {
        return <NeovimSurface renderer={this._renderer}
                neovimInstance={this._neovimInstance}
                deltaRegionTracker={this._deltaRegionManager}
                screen={this._screen} />
    }

    private _onModeChanged(newMode: string): void {
        UI.Actions.setMode(newMode)

        if (newMode === "normal") {
            UI.Actions.showCursorLine()
            UI.Actions.showCursorColumn()
            UI.Actions.hideCompletions()
            UI.Actions.hideSignatureHelp()
        } else if (newMode === "insert") {
            UI.Actions.hideQuickInfo()
            UI.Actions.showCursorColumn()
            UI.Actions.showCursorLine()
        } else if (newMode.indexOf("cmdline") >= 0) {
            UI.Actions.hideCursorLine()
            UI.Actions.hideCursorColumn() // TODO: cleaner way to hide and unhide?
            UI.Actions.hideCompletions()
            UI.Actions.hideQuickInfo()
        }
    }

    private _onVimEvent(eventName: string, evt: Oni.EventContext): void {
        // TODO: Can we get rid of these?
        this._liveEvaluationOverlay.onVimEvent(eventName, evt)

        UI.Actions.setWindowState(evt.windowNumber, evt.bufferFullPath, evt.column, evt.line, evt.winline, evt.wincol, evt.windowTopLine, evt.windowBottomLine)
        UI.Actions.setBufferState(evt.bufferFullPath, evt.bufferTotalLines)

        this._tasks.onEvent(evt)

        if (eventName === "BufEnter") {
            // TODO: More convenient way to hide all UI?
            UI.Actions.hideCompletions()
            UI.Actions.hidePopupMenu()
            UI.Actions.hideSignatureHelp()
            UI.Actions.hideQuickInfo()
        }

        if (eventName === "DirChanged") {
            this._neovimInstance.getCurrentWorkingDirectory()
                .then((newDirectory) => process.chdir(newDirectory))
        }
    }

    private _onConfigChanged(): void {
        this._neovimInstance.setFont(this._config.getValue("editor.fontFamily"), this._config.getValue("editor.fontSize"))
        this._onUpdate()
    }

    private _onUpdate(): void {
        UI.Actions.setCursorPosition(this._screen)

        if (!!this._pendingTimeout) {
            clearTimeout(this._pendingTimeout) // FIXME: null
            this._pendingTimeout = null
        }
    }

    private _render(): void {
        if (this._pendingTimeout) {
            UI.Actions.setCursorPosition(this._screen)
        }

        this._renderer.update(this._screen, this._deltaRegionManager)

        this._deltaRegionManager.cleanUpRenderedCells()

        window.requestAnimationFrame(() => this._render())
    }
}
