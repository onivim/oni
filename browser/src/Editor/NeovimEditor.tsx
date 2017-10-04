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
import { IPluginManager, NeovimInstance, NeovimWindowManager } from "./../neovim"
import { CanvasRenderer, INeovimRenderer } from "./../Renderer"
import { NeovimScreen } from "./../Screen"

import * as Config from "./../Config"
import { Event, IEvent } from "./../Event"

import { PluginManager } from "./../Plugins/PluginManager"

import { BufferUpdates } from "./../Services/BufferUpdates"
import { commandManager } from "./../Services/CommandManager"
import { registerBuiltInCommands } from "./../Services/Commands"
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

export class CommonNeovimEditor implements IEditor {
    private _neovimInstance: NeovimInstance
    private _hasLoaded: boolean
    private _currentMode: string
    private _onModeChangedEvent: Event<string> = new Event<string>()
    private _pendingTimeout: any = null
    private _pendingAnimationFrame: boolean = false

    // Capabilities
    public get neovim(): Oni.NeovimEditorCapability {
        return this._neovimInstance
    }

    public get mode(): string {
        return this._currentMode
    }

    public get onModeChanged(): IEvent<string> {
        return this._onModeChangedEvent
    }

    /** Protected Properties */
    protected get neovimInstance(): NeovimInstance {
        return this._neovimInstance
    }

    protected get hasLoaded(): boolean {
        return this._hasLoaded
    }

    protected get config(): Config.Config {
        return this._config
    }

    protected get pluginManager(): IPluginManager {
        return this._pluginManager
    }

    constructor(
        private _pluginManager: IPluginManager,
        private _config: Config.Config = Config.instance(),
    ) {
            this._neovimInstance = new NeovimInstance(this._pluginManager, 100, 100)
            this._neovimInstance.on("mode-change", (newMode: string) => this._onModeChanged(newMode))

            this._onConfigChanged(this._config.getValues())
            this._config.onConfigurationChanged.subscribe((newValues: Partial<Config.IConfigValues>) => this._onConfigChanged(newValues))

        this.neovimInstance.on("action", (action: any) => this._onAction(action))

    }

    public init(filesToOpen: string[]): Promise<void> {
        return this._neovimInstance.start(filesToOpen)
            .then(() => {
                this._hasLoaded = true
                VimConfigurationSynchronizer.synchronizeConfiguration(this.neovimInstance, this._config.getValues())
            })
    }

    public /* virtual */ render(): JSX.Element {
        return null
    }

    protected _onAction(action: any): void {
        this._scheduleRender()

        if (!this._pendingTimeout) {
            this._pendingTimeout = setTimeout(() => this._onUpdate(), 0)
        }
    }

    protected _onModeChanged(newMode: string): void {
        UI.Actions.setMode(newMode)

        this._currentMode = newMode
        this._onModeChangedEvent.dispatch(newMode)
    }

    protected _onConfigChanged(newValues: Partial<Config.IConfigValues>): void {
        this._neovimInstance.setFont(this._config.getValue("editor.fontFamily"), this._config.getValue("editor.fontSize"), this._config.getValue("editor.linePadding"))

        if (this.hasLoaded) {
            VimConfigurationSynchronizer.synchronizeConfiguration(this.neovimInstance, newValues)
        }

        this._onUpdate()
        this._scheduleRender()
    }

    protected _onUpdate(): void {
        // UI.Actions.setCursorPosition(this._screen)

        if (!!this._pendingTimeout) {
            clearTimeout(this._pendingTimeout) // FIXME: null
            this._pendingTimeout = null
        }
    }

    protected _scheduleRender(): void {
        if (this._pendingAnimationFrame) {
            return
        }

        this._pendingAnimationFrame = true
        window.requestAnimationFrame(() => this._render())
    }

    protected _render(): void {
        this._pendingAnimationFrame = false

        // if (this._pendingTimeout) {
        //     UI.Actions.setCursorPosition(this._screen)
        // }
    }
}

export class NeovimEditor extends CommonNeovimEditor implements IEditor {

    private _deltaRegionManager: IncrementalDeltaRegionTracker
    private _renderer: INeovimRenderer
    private _screen: NeovimScreen

    private _element: HTMLElement
    private _pluginManager2: PluginManager

    // Overlays
    private _windowManager: NeovimWindowManager

    private _errorStartingNeovim: boolean = false

    constructor(
        pluginManager: PluginManager,
        config: Config.Config,
    ) {
        super(pluginManager, config)

        this._pluginManager2 = pluginManager
        const services: any[] = []

        this._deltaRegionManager = new IncrementalDeltaRegionTracker()
        this._screen = new NeovimScreen(this._deltaRegionManager)

        this._renderer = new CanvasRenderer()

        // Services
        const bufferUpdates = new BufferUpdates(this.neovimInstance, this._pluginManager2)
        const errorService = new Errors(this.neovimInstance)
        const windowTitle = new WindowTitle(this.neovimInstance)
        const syntaxHighlighter = new SyntaxHighlighter(this.neovimInstance, this._pluginManager2)

        registerBuiltInCommands(commandManager, this._pluginManager2, this.neovimInstance, bufferUpdates)

        tasks.registerTaskProvider(commandManager)
        tasks.registerTaskProvider(errorService)

        services.push(bufferUpdates)
        services.push(errorService)
        services.push(windowTitle)
        services.push(syntaxHighlighter)

        // Overlays
        // TODO: Replace `OverlayManagement` concept and associated window management code with
        // explicit window management: #362
        this._windowManager = new NeovimWindowManager(this._screen, this.neovimInstance)

        this._windowManager.on("current-window-size-changed", (dimensionsInPixels: Rectangle, windowId: number) => {
            UI.Actions.setWindowDimensions(windowId, dimensionsInPixels)
        })

        this.neovimInstance.onYank.subscribe((yankInfo) => {
            if (Config.instance().getValue("editor.clipboard.enabled")) {
                clipboard.writeText(yankInfo.regcontents.join(require("os").EOL))
            }
        })

        // TODO: Refactor `pluginManager` responsibilities outside of this instance
        this._pluginManager2.on("signature-help-response", (err: string, signatureHelp: any) => { // FIXME: setup Oni import
            if (err) {
                UI.Actions.hideSignatureHelp()
            } else {
                UI.Actions.showSignatureHelp(signatureHelp)
            }
        })

        this._pluginManager2.on("set-errors", (key: string, fileName: string, errors: types.Diagnostic[]) => {

            UI.Actions.setErrors(fileName, key, errors)

            errorService.setErrors(fileName, errors)
        })

        this._pluginManager2.on("find-all-references", (references: Oni.Plugin.ReferencesResult) => {
            const convertToQuickFixItem = (item: Oni.Plugin.ReferencesResultItem) => ({
                filename: item.fullPath,
                lnum: item.line,
                col: item.column,
                text: item.lineText || references.tokenName,
            })

            const quickFixItems = references.items.map((item) => convertToQuickFixItem(item))

            this.neovimInstance.quickFix.setqflist(quickFixItems, ` Find All References: ${references.tokenName}`)
            this.neovimInstance.command("copen")
            this.neovimInstance.command(`execute "normal! /${references.tokenName}\\<cr>"`)
        })

        this.neovimInstance.on("event", (eventName: string, evt: any) => this._onVimEvent(eventName, evt))

        this.neovimInstance.on("error", (_err: string) => {
            this._errorStartingNeovim = true
            ReactDOM.render(<InstallHelp />, this._element.parentElement)
        })

        this.neovimInstance.on("window-display-update", (evt: Oni.EventContext, lineMapping: any) => {
            UI.Actions.setWindowState(evt.windowNumber, evt.bufferFullPath, evt.column, evt.line, evt.winline, evt.wincol, evt.windowTopLine, evt.windowBottomLine)
            UI.Actions.setWindowLineMapping(evt.windowNumber, lineMapping)
        })

        this.neovimInstance.on("tabline-update", (currentTabId: number, tabs: any[]) => {
            UI.Actions.setTabs(currentTabId, tabs)
        })

        this.neovimInstance.on("buffer-update", (args: Oni.EventContext) => {
            UI.Actions.bufferUpdate(args.bufferNumber, args.modified, args.version, args.bufferTotalLines)
        })

        this.neovimInstance.on("buffer-update-incremental", (args: Oni.EventContext) => {
            UI.Actions.bufferUpdate(args.bufferNumber, args.modified, args.version, args.bufferTotalLines)
        })

        this._render()

        const browserWindow = remote.getCurrentWindow()

        browserWindow.on("blur", () => {
            this.neovimInstance.executeAutoCommand("FocusLost")
        })

        browserWindow.on("focus", () => {
            this.neovimInstance.executeAutoCommand("FocusGained")
        })

        window["__neovim"] = this.neovimInstance // tslint:disable-line no-string-literal
        window["__screen"] = this._screen // tslint:disable-line no-string-literal

        ipcRenderer.on("menu-item-click", (_evt: any, message: string) => {
            if (message.startsWith(":")) {
                this.neovimInstance.command("exec \"" + message + "\"")
            } else {
                this.neovimInstance.command("exec \":normal! " + message + "\"")
            }
        })

        const openFiles = async (files: string[], action: string) => {

            await this.neovimInstance.callFunction("OniOpenFile", [action, files[0]])

            for (let i = 1; i < files.length; i++) {
                this.neovimInstance.command("exec \"" + action + " " + normalizePath(files[i]) + "\"")
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
            this.neovimInstance.open(normalizePath(files[0].path))
            // open any subsequent files in new tabs
            for (let i = 1; i < files.length; i++) {
                this.neovimInstance.command("exec \":tabe " + normalizePath(files.item(i).path) + "\"")
            }
        }
    }

    public executeCommand(command: string): void {
        commandManager.executeCommand(command, null)
    }

    public render(): JSX.Element {

        const onBufferClose = (bufferId: number) => {
            this.neovimInstance.command(`bw ${bufferId}`)
        }

        const onBufferSelect = (bufferId: number) => {
            this.neovimInstance.command(`buf ${bufferId}`)
        }

        const onTabClose = (tabId: number) => {
            this.neovimInstance.command(`tabclose ${tabId}`)
        }

        const onTabSelect = (tabId: number) => {
            this.neovimInstance.command(`tabn ${tabId}`)
        }

        const onKeyDown = (key: string) => {
            this._onKeyDown(key)
        }

        return <NeovimSurface renderer={this._renderer}
            neovimInstance={this.neovimInstance}
            deltaRegionTracker={this._deltaRegionManager}
            screen={this._screen}
            onKeyDown={onKeyDown}
            onBufferClose={onBufferClose}
            onBufferSelect={onBufferSelect}
            onTabClose={onTabClose}
            onTabSelect={onTabSelect} />
    }

    protected /* override */ _onAction(action: any): void {
        super._onAction(action)

        this._renderer.onAction(action)
        this._screen.dispatch(action)

        UI.Actions.setColors(this._screen.foregroundColor, this._screen.backgroundColor)
    }

    protected /* override */ _onModeChanged(newMode: string): void {
        super._onModeChanged(newMode)

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


    protected /* override */ _onConfigChanged(newValues: Partial<Config.IConfigValues>): void {
        super._onConfigChanged(newValues)

        const fontFamily = this.config.getValue("editor.fontFamily")
        const fontSize = this.config.getValue("editor.fontSize")

        UI.Actions.setFont(fontFamily, fontSize)
    }

    protected /* override */ _onUpdate(): void {
        super._onUpdate()
        if (this._screen) {
            UI.Actions.setCursorPosition(this._screen)
        }
    }

    protected _render(): void {
        super._render()

        // Needed?

        // if (this._pendingTimeout) {
        //     UI.Actions.setCursorPosition(this._screen)
        // }

        this._renderer.update(this._screen, this._deltaRegionManager)
        this._deltaRegionManager.cleanUpRenderedCells()
    }

    private _onVimEvent(eventName: string, evt: Oni.EventContext): void {
        UI.Actions.setWindowState(evt.windowNumber, evt.bufferFullPath, evt.column, evt.line, evt.winline, evt.wincol, evt.windowTopLine, evt.windowBottomLine)

        tasks.onEvent(evt)

        if (eventName === "BufEnter") {
            // TODO: More convenient way to hide all UI?
            UI.Actions.hideCompletions()
            UI.Actions.hidePopupMenu()
            UI.Actions.hideSignatureHelp()
            UI.Actions.hideQuickInfo()

            UI.Actions.bufferEnter(evt.bufferNumber, evt.bufferFullPath, evt.bufferTotalLines, evt.hidden, evt.listed)
        } else if (eventName === "BufWritePost") {
            // After we save we aren't modified... but we can pass it in just to be safe
            UI.Actions.bufferSave(evt.bufferNumber, evt.modified, evt.version)
        } else if (eventName === "BufDelete") {

            this.neovimInstance.getBufferIds()
                .then((ids) => UI.Actions.setCurrentBuffers(ids))
        }
    }
    private _onKeyDown(key: string): void {
        this.neovimInstance.input(key)
    }
}
