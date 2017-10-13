/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"
import * as ReactDOM from "react-dom"

import * as types from "vscode-languageserver-types"

import { clipboard, ipcRenderer, remote } from "electron"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { IFullBufferUpdateEvent, IIncrementalBufferUpdateEvent, NeovimInstance, NeovimWindowManager } from "./../neovim"
import { CanvasRenderer, INeovimRenderer } from "./../Renderer"
import { NeovimScreen } from "./../Screen"

import { Event, IEvent } from "./../Event"

import { PluginManager } from "./../Plugins/PluginManager"

import { BufferUpdates } from "./../Services/BufferUpdates"
import { commandManager } from "./../Services/CommandManager"
import { registerBuiltInCommands } from "./../Services/Commands"
import { configuration, IConfigurationValues } from "./../Services/Configuration"
import { Errors } from "./../Services/Errors"
import { SyntaxHighlighter } from "./../Services/SyntaxHighlighter"
import { WindowTitle } from "./../Services/WindowTitle"

import * as UI from "./../UI/index"
import { Rectangle } from "./../UI/Types"

import { IEditor } from "./Editor"

import { InstallHelp } from "./../UI/components/InstallHelp"

import { NeovimSurface } from "./NeovimSurface"

import { tasks } from "./../Services/Tasks"

import { normalizePath } from "./../Utility"

import * as VimConfigurationSynchronizer from "./../Services/VimConfigurationSynchronizer"

export class NeovimEditor implements IEditor {

    private _neovimInstance: NeovimInstance
    private _deltaRegionManager: IncrementalDeltaRegionTracker
    private _renderer: INeovimRenderer
    private _screen: NeovimScreen

    private _pendingTimeout: any = null
    private _pendingAnimationFrame: boolean = false
    private _element: HTMLElement

    private _currentMode: string
    private _onModeChangedEvent = new Event<string>()
    private _onBufferEnterEvent = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferLeaveEvent = new Event<Oni.EditorBufferEventArgs>()

    private _hasLoaded: boolean = false

    private _windowManager: NeovimWindowManager

    private _errorStartingNeovim: boolean = false

    private _isFirstRender: boolean = true

    public get mode(): string {
        return this._currentMode
    }

    // Events
    public get onModeChanged(): IEvent<string> {
        return this._onModeChangedEvent
    }

    public get onBufferEnter(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferEnterEvent
    }

    public get onBufferLeave(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferLeaveEvent
    }

    // Capabilities
    public get neovim(): Oni.NeovimEditorCapability {
        return this._neovimInstance
    }

    constructor(
        private _pluginManager: PluginManager,
        private _config = configuration,
    ) {
        const services: any[] = []

        this._neovimInstance = new NeovimInstance(this._pluginManager, 100, 100)
        this._deltaRegionManager = new IncrementalDeltaRegionTracker()
        this._screen = new NeovimScreen(this._deltaRegionManager)

        this._renderer = new CanvasRenderer()

        // Services
        const bufferUpdates = new BufferUpdates(this._neovimInstance, this._pluginManager)
        const errorService = new Errors(this._neovimInstance)
        const windowTitle = new WindowTitle(this._neovimInstance)
        const syntaxHighlighter = new SyntaxHighlighter(this._neovimInstance, this._pluginManager)

        registerBuiltInCommands(commandManager, this._pluginManager, this._neovimInstance, bufferUpdates)

        tasks.registerTaskProvider(commandManager)
        tasks.registerTaskProvider(errorService)

        services.push(bufferUpdates)
        services.push(errorService)
        services.push(windowTitle)
        services.push(syntaxHighlighter)

        // Overlays
        // TODO: Replace `OverlayManagement` concept and associated window management code with
        // explicit window management: #362
        this._windowManager = new NeovimWindowManager(this._screen, this._neovimInstance)

        this._windowManager.on("current-window-size-changed", (dimensionsInPixels: Rectangle, windowId: number) => {
            UI.Actions.setWindowDimensions(windowId, dimensionsInPixels)
        })

        this._neovimInstance.onYank.subscribe((yankInfo) => {
            if (configuration.getValue("editor.clipboard.enabled")) {
                clipboard.writeText(yankInfo.regcontents.join(require("os").EOL))
            }
        })

        this._neovimInstance.onOniCommand.subscribe((command) => {
            commandManager.executeCommand(command)
        })

        this._pluginManager.on("set-errors", (key: string, fileName: string, errors: types.Diagnostic[]) => {

            UI.Actions.setErrors(fileName, key, errors)

            errorService.setErrors(fileName, errors)
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

        this._neovimInstance.on("window-display-update", (evt: Oni.EventContext, lineMapping: any) => {
            UI.Actions.setWindowState(evt.windowNumber, evt.bufferFullPath, evt.column, evt.line, evt.winline, evt.wincol, evt.windowTopLine, evt.windowBottomLine)
            UI.Actions.setWindowLineMapping(evt.windowNumber, lineMapping)
        })

        this._neovimInstance.on("action", (action: any) => {
            this._renderer.onAction(action)
            this._screen.dispatch(action)

            this._scheduleRender()

            UI.Actions.setColors(this._screen.foregroundColor, this._screen.backgroundColor)

            if (!this._pendingTimeout) {
                this._pendingTimeout = setTimeout(() => this._onUpdate(), 0)
            }
        })

        this._neovimInstance.on("tabline-update", (currentTabId: number, tabs: any[]) => {
            UI.Actions.setTabs(currentTabId, tabs)
        })

        this._neovimInstance.on("mode-change", (newMode: string) => this._onModeChanged(newMode))

        this._neovimInstance.onBufferUpdate.subscribe((bufferUpdateEvent: IFullBufferUpdateEvent) => {
            const args = bufferUpdateEvent.context
            UI.Actions.bufferUpdate(args.bufferNumber, args.modified, args.version, args.bufferTotalLines)
        })

        this._neovimInstance.onBufferUpdateIncremental.subscribe((bufferUpdateEvent: IIncrementalBufferUpdateEvent) => {
            const args = bufferUpdateEvent.context
            UI.Actions.bufferUpdate(args.bufferNumber, args.modified, args.version, args.bufferTotalLines)
        })

        this._render()

        const browserWindow = remote.getCurrentWindow()

        browserWindow.on("blur", () => {
            this._neovimInstance.executeAutoCommand("FocusLost")
        })

        browserWindow.on("focus", () => {
            this._neovimInstance.executeAutoCommand("FocusGained")
        })

        this._onConfigChanged(this._config.getValues())
        this._config.onConfigurationChanged.subscribe((newValues: Partial<IConfigurationValues>) => this._onConfigChanged(newValues))

        window["__neovim"] = this._neovimInstance // tslint:disable-line no-string-literal
        window["__screen"] = this._screen // tslint:disable-line no-string-literal

        ipcRenderer.on("menu-item-click", (_evt: any, message: string) => {
            if (message.startsWith(":")) {
                this._neovimInstance.command("exec \"" + message + "\"")
            } else {
                this._neovimInstance.command("exec \":normal! " + message + "\"")
            }
        })

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

            const files = ev.dataTransfer.files
            // open first file in current editor
            this._neovimInstance.open(normalizePath(files[0].path))
            // open any subsequent files in new tabs
            for (let i = 1; i < files.length; i++) {
                this._neovimInstance.command("exec \":tabe " + normalizePath(files.item(i).path) + "\"")
            }
        }
    }

    public executeCommand(command: string): void {
        commandManager.executeCommand(command, null)
    }

    public init(filesToOpen: string[]): void {
        this._neovimInstance.start(filesToOpen)
            .then(() => {
                this._hasLoaded = true
                VimConfigurationSynchronizer.synchronizeConfiguration(this._neovimInstance, this._config.getValues())
            })
    }

    public render(): JSX.Element {

        const onBufferClose = (bufferId: number) => {
            this._neovimInstance.command(`bw ${bufferId}`)
        }

        const onBufferSelect = (bufferId: number) => {
            this._neovimInstance.command(`buf ${bufferId}`)
        }

        const onTabClose = (tabId: number) => {
            this._neovimInstance.command(`tabclose ${tabId}`)
        }

        const onTabSelect = (tabId: number) => {
            this._neovimInstance.command(`tabn ${tabId}`)
        }

        const onKeyDown = (key: string) => {
            this._onKeyDown(key)
        }

        return <NeovimSurface renderer={this._renderer}
            neovimInstance={this._neovimInstance}
            deltaRegionTracker={this._deltaRegionManager}
            screen={this._screen}
            onKeyDown={onKeyDown}
            onBufferClose={onBufferClose}
            onBufferSelect={onBufferSelect}
            onTabClose={onTabClose}
            onTabSelect={onTabSelect} />
    }

    private _onModeChanged(newMode: string): void {
        UI.Actions.setMode(newMode)

        this._currentMode = newMode
        this._onModeChangedEvent.dispatch(newMode)

        if (newMode === "normal") {
            UI.Actions.hideCompletions()
            UI.Actions.hideSignatureHelp()
        } else if (newMode.indexOf("cmdline") >= 0) {
            UI.Actions.hideCompletions()
        }
    }

    private _onVimEvent(eventName: string, evt: Oni.EventContext): void {
        UI.Actions.setWindowState(evt.windowNumber, evt.bufferFullPath, evt.column, evt.line, evt.winline, evt.wincol, evt.windowTopLine, evt.windowBottomLine)

        tasks.onEvent(evt)

        if (eventName === "BufEnter") {

            this._onBufferEnterEvent.dispatch({
                filePath: evt.bufferFullPath,
                language: evt.filetype,
            })

            UI.Actions.hideCompletions()
            UI.Actions.hideSignatureHelp()

            UI.Actions.bufferEnter(evt.bufferNumber, evt.bufferFullPath, evt.bufferTotalLines, evt.hidden, evt.listed)
        } else if (eventName === "BufLeave") {
            this._onBufferLeaveEvent.dispatch({
                filePath: evt.bufferFullPath,
                language: evt.filetype,
            })
        } else if (eventName === "BufWritePost") {
            // After we save we aren't modified... but we can pass it in just to be safe
            UI.Actions.bufferSave(evt.bufferNumber, evt.modified, evt.version)
        } else if (eventName === "BufDelete") {

            this._neovimInstance.getBufferIds()
                .then((ids) => UI.Actions.setCurrentBuffers(ids))
        }
    }

    private _onConfigChanged(newValues: Partial<IConfigurationValues>): void {
        const fontFamily = this._config.getValue("editor.fontFamily")
        const fontSize = this._config.getValue("editor.fontSize")
        const linePadding = this._config.getValue("editor.linePadding")

        UI.Actions.setFont(fontFamily, fontSize)
        this._neovimInstance.setFont(fontFamily, fontSize, linePadding)

        if (this._hasLoaded) {
            VimConfigurationSynchronizer.synchronizeConfiguration(this._neovimInstance, newValues)
        }

        this._isFirstRender = true

        this._onUpdate()
        this._scheduleRender()
    }

    private _onUpdate(): void {
        UI.Actions.setCursorPosition(this._screen)

        if (!!this._pendingTimeout) {
            clearTimeout(this._pendingTimeout) // FIXME: null
            this._pendingTimeout = null
        }
    }

    private _scheduleRender(): void {
        if (this._pendingAnimationFrame) {
            return
        }

        this._pendingAnimationFrame = true
        window.requestAnimationFrame(() => this._render())
    }

    private _render(): void {
        this._pendingAnimationFrame = false

        if (this._pendingTimeout) {
            UI.Actions.setCursorPosition(this._screen)
        }

        if (this._hasLoaded) {
            if (this._isFirstRender) {
                this._isFirstRender = false
                this._renderer.redrawAll(this._screen)
            } else {
                const modifiedCells = this._deltaRegionManager.getModifiedCells()

                if (modifiedCells.length === 0) {
                    return
                }

                modifiedCells.forEach((c) => this._deltaRegionManager.notifyCellRendered(c.x, c.y))
                this._renderer.draw(this._screen, modifiedCells)
            }
        }

        this._deltaRegionManager.cleanUpRenderedCells()
    }

    private _onKeyDown(key: string): void {
        this._neovimInstance.input(key)
    }
}
