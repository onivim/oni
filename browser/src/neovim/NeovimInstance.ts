import { remote } from "electron"
import { EventEmitter } from "events"
import * as path from "path"

import { Event, IEvent } from "./../Event"
import * as Log from "./../Log"

import { Buffer, IBuffer } from "./Buffer"
import { NeovimBufferReference, NeovimWindowReference } from "./MsgPack"
import { startNeovim } from "./NeovimProcessSpawner"
import { IQuickFixList, QuickFixList } from "./QuickFix"
import { Session } from "./Session"
import { IWindow, Window } from "./Window"

import * as Actions from "./../actions"
import { measureFont } from "./../Font"
import { PluginManager } from "./../Plugins/PluginManager"
import { IPixelPosition, IPosition } from "./../Screen"
import { configuration } from "./../Services/Configuration"

export interface INeovimYankInfo {
    operator: string
    regcontents: string[]
    regname: string
    regtype: string
}

export interface INeovimApiVersion {
    major: number
    minor: number
    patch: number
}

export interface IFullBufferUpdateEvent {
    context: Oni.EventContext
    bufferLines: string[]
}

export interface IIncrementalBufferUpdateEvent {
    context: Oni.EventContext
    lineNumber: number
    lineContents: string
}

// Limit for the number of lines to handle buffer updates
// If the file is too large, it ends up being too much traffic
// between Neovim <-> Oni <-> Language Servers - so
// set a hard limit. In the future, if need be, this could be
// moved to a configuration setting.
export const MAX_LINES_FOR_BUFFER_UPDATE = 5000

export type NeovimEventHandler = (...args: any[]) => void

export interface INeovimInstance {
    cursorPosition: IPosition
    quickFix: IQuickFixList

    // Events
    onYank: IEvent<INeovimYankInfo>

    onBufferUpdate: IEvent<IFullBufferUpdateEvent>

    onBufferUpdateIncremental: IEvent<IIncrementalBufferUpdateEvent>

    // When an OniCommand is requested, ie :OniCommand("quickOpen.show")
    onOniCommand: IEvent<string>

    screenToPixels(row: number, col: number): IPixelPosition

    /**
     * Supply input (keyboard/mouse) to Neovim
     */
    input(inputString: string): void

    /**
     * Call a VimL function
     */
    callFunction(functionName: string, args: any[]): Promise<any>

    /**
     * Change the working directory of Neovim
     */
    chdir(directoryPath: string): Promise<any>

    /**
     * Execute a VimL command
     */
    command(command: string): Promise<any>

    /**
     * Evaluate a VimL block
     */
    eval(expression: string): Promise<any>

    // TODO:
    // - Refactor remaining events into strongly typed events, as part of the interface
    on(event: string, handler: NeovimEventHandler): void

    setFont(fontFamily: string, fontSize: string, linePadding: number): void

    getBufferIds(): Promise<number[]>

    getCurrentBuffer(): Promise<IBuffer>
    getCurrentWindow(): Promise<IWindow>

    getCursorColumn(): Promise<number>
    getCursorRow(): Promise<number>

    getApiVersion(): Promise<INeovimApiVersion>

    open(fileName: string): Promise<void>
    openInitVim(): Promise<void>

    executeAutoCommand(autoCommand: string): Promise<void>
}

/**
 * Integration with NeoVim API
 */
export class NeovimInstance extends EventEmitter implements INeovimInstance {
    private _neovim: Session
    private _initPromise: Promise<void>

    private _config = configuration

    private _fontFamily: string = this._config.getValue("editor.fontFamily")
    private _fontSize: string = this._config.getValue("editor.fontSize")
    private _fontWidthInPixels: number
    private _fontHeightInPixels: number

    private _lastHeightInPixels: number
    private _lastWidthInPixels: number

    private _rows: number
    private _cols: number

    private _pluginManager: PluginManager
    private _quickFix: QuickFixList

    private _onYank = new Event<INeovimYankInfo>()
    private _onOniCommand = new Event<string>()
    private _onFullBufferUpdateEvent = new Event<IFullBufferUpdateEvent>()
    private _onIncrementalBufferUpdateEvent = new Event<IIncrementalBufferUpdateEvent>()

    public get quickFix(): IQuickFixList {
        return this._quickFix
    }

    public get onBufferUpdate(): IEvent<IFullBufferUpdateEvent> {
        return this._onFullBufferUpdateEvent
    }

    public get onBufferUpdateIncremental(): IEvent<IIncrementalBufferUpdateEvent> {
        return this._onIncrementalBufferUpdateEvent
    }

    public get onOniCommand(): IEvent<string> {
        return this._onOniCommand
    }

    public get onYank(): IEvent<INeovimYankInfo> {
        return this._onYank
    }

    constructor(pluginManager: PluginManager, widthInPixels: number, heightInPixels: number) {
        super()

        this._pluginManager = pluginManager

        this._lastWidthInPixels = widthInPixels
        this._lastHeightInPixels = heightInPixels
        this._quickFix = new QuickFixList(this)
    }

    public async chdir(directoryPath: string): Promise<void> {
        await this.command(`cd! ${directoryPath}`)
    }

    public async executeAutoCommand(autoCommand: string): Promise<void> {
        const doesAutoCommandExist = await this.eval(`exists('#${autoCommand}')`)

        if (doesAutoCommandExist) {
            await this.command(`doautocmd <nomodeline> ${autoCommand}`)
        }
    }

    public start(filesToOpen?: string[]): Promise<void> {
        filesToOpen = filesToOpen || []

        this._initPromise = Promise.resolve(startNeovim(this._pluginManager.getAllRuntimePaths(), filesToOpen))
            .then((nv) => {
                Log.info("NeovimInstance: Neovim started")

                // Workaround for issue where UI
                // can fail to attach if there is a UI-blocking error
                // nv.input("<ESC>")

                this._neovim = nv

                this._neovim.on("error", (err: Error) => {
                    Log.error(err)
                })

                this._neovim.on("notification", (method: any, args: any) => {
                    if (method === "redraw") {
                        this._handleNotification(method, args)
                    } else if (method === "oni_plugin_notify") {
                        const pluginArgs = args[0]
                        const pluginMethod = pluginArgs.shift()

                        // TODO: Update pluginManager to subscribe from event here, instead of dupliating this

                        if (pluginMethod === "buffer_update") {
                            const eventContext: Oni.EventContext = args[0][0]
                            const startRange: number = args[0][1]
                            const endRange: number = args[0][2]

                            this._onFullBufferUpdate(eventContext, startRange, endRange)
                        } else if (pluginMethod === "oni_yank") {
                            this._onYank.dispatch(args[0][0])
                        } else if (pluginMethod === "oni_command") {
                            this._onOniCommand.dispatch(args[0][0])
                        } else if (pluginMethod === "event") {
                            const eventName = args[0][0]
                            const eventContext = args[0][1]

                            if (eventName === "DirChanged") {
                                this._updateProcessDirectory()
                            }

                            this.emit("event", eventName, eventContext)

                        } else if (pluginMethod === "incremental_buffer_update") {
                            const eventContext = args[0][0]
                            const lineContents = args[0][1]
                            const lineNumber = args[0][2]

                            this._onIncrementalBufferUpdateEvent.dispatch({
                                context: eventContext,
                                lineNumber,
                                lineContents,
                            })
                        } else if (pluginMethod === "window_display_update") {
                            this.emit("window-display-update", args[0][0], args[0][1], args[0][2])
                        } else {
                            Log.warn("Unknown event from oni_plugin_notify: " + pluginMethod)
                        }
                    } else {
                        Log.warn("Unknown notification: " + method)
                    }
                })

                this._neovim.on("request", (method: any, _args: any, _resp: any) => {
                    Log.warn("Unhandled request: " + method)
                })

                this._neovim.on("disconnect", () => {

                    if (!configuration.getValue("debug.persistOnNeovimExit")) {
                        remote.getCurrentWindow().close()
                    }
                })

                const size = this._getSize()
                this._rows = size.rows
                this._cols = size.cols

                // Workaround for bug in neovim/node-client
                // The 'uiAttach' method overrides the new 'nvim_ui_attach' method
                return this._attachUI(size.cols, size.rows)
                    .then(async () => {
                        Log.info("Attach success")

                        performance.mark("NeovimInstance.Plugins.Start")
                        const api = this._pluginManager.startPlugins(this)
                        performance.mark("NeovimInstance.Plugins.End")

                        configuration.activate(api)

                        // TODO: #702 - Batch these calls via `nvim_call_atomic`
                        // Override completeopt so Oni works correctly with external popupmenu
                        await this.command("set completeopt=longest,menu")

                        // set title after attaching listeners so we can get the initial title
                        await this.command("set title")
                        await this.callFunction("OniConnect", [])
                    },
                    (err: any) => {
                        this.emit("error", err)
                    })
            })

        return this._initPromise
    }

    public getMode(): Promise<string> {
        return this.eval<string>("mode()")
    }

    /**
     * Returns the current cursor column in buffer-space
     */
    public getCursorColumn(): Promise<number> {
        return this.eval<number>("col('.')")
    }

    /** Returns the current cursor row in buffer-space
     */
    public getCursorRow(): Promise<number> {
        return this.eval<number>("line('.')")
    }

    public setFont(fontFamily: string, fontSize: string, linePadding: number): void {
        this._fontFamily = fontFamily
        this._fontSize = fontSize

        const { width, height } = measureFont(this._fontFamily, this._fontSize)

        this._fontWidthInPixels = width
        this._fontHeightInPixels = height + linePadding

        this.emit("action", Actions.setFont(fontFamily, fontSize, width, height + linePadding, linePadding))

        this.resize(this._lastWidthInPixels, this._lastHeightInPixels)
    }

    public open(fileName: string): Promise<void> {
        return this.command(`e! ${fileName}`)
    }

    public openInitVim(): Promise<void> {
        const loadInitVim = configuration.getValue("oni.loadInitVim")

        if (typeof(loadInitVim) === "string") {
            return this.open(loadInitVim)
        } else {
            return this.open("$MYVIMRC")
        }
    }

    public eval<T>(expression: string): Promise<T> {
        return this._neovim.request("nvim_eval", [expression])
    }

    public command(command: string): Promise<void> {
        Log.verbose("[NeovimInstance] Executing command: " + command)
        return this._neovim.request("nvim_command", [command])
    }

    public callFunction(functionName: string, args: any[]): Promise<void> {
        return this._neovim.request<void>("nvim_call_function", [functionName, args])
    }

    public async getCurrentBuffer(): Promise<IBuffer> {
        const bufferReference = await this._neovim.request<NeovimBufferReference>("nvim_get_current_buf", [])
        return new Buffer(bufferReference, this._neovim)
    }

    public async getBufferIds(): Promise<number[]> {
        const buffers = await this._neovim.request<NeovimBufferReference[]>("nvim_list_bufs", [])

        return buffers.map((b) => b.id as any)
    }

    public async getCurrentWorkingDirectory(): Promise<string> {
        const currentWorkingDirectory = await this.eval<string>("getcwd()")
        return path.normalize(currentWorkingDirectory)
    }

    public async getCurrentWindow(): Promise<IWindow> {
        const windowReference = await this._neovim.request<NeovimWindowReference>("nvim_get_current_win", [])
        return new Window(windowReference, this._neovim)
    }

    public get cursorPosition(): IPosition {
        return {
            row: 0,
            column: 0,
        }
    }

    public screenToPixels(_row: number, _col: number): IPixelPosition {
        return {
            x: 0,
            y: 0,
        }
    }

    public input(inputString: string): Promise<void> {
        this._neovim.request("nvim_input", [inputString])
        return Promise.resolve(null)
    }

    public resize(widthInPixels: number, heightInPixels: number): void {
        this._lastWidthInPixels = widthInPixels
        this._lastHeightInPixels = heightInPixels

        const size = this._getSize()

        this._resizeInternal(size.rows, size.cols)
    }

    public async getApiVersion(): Promise<INeovimApiVersion> {
        const versionInfo = await this._neovim.request("nvim_get_api_info", [])
        return versionInfo[1].version as any
    }

    private _resizeInternal(rows: number, columns: number): void {

        if (this._config.hasValue("debug.fixedSize")) {
            const fixedSize = this._config.getValue("debug.fixedSize")
            rows = fixedSize.rows
            columns = fixedSize.columns
            Log.warn("Overriding screen size based on debug.fixedSize")
        }

        if (rows === this._rows && columns === this._cols) {
            return
        }

        this._rows = rows
        this._cols = columns

        // If _initPromise isn't initialized, it means the UI hasn't attached to NeoVim
        // yet. In that case, we don't need to call uiTryResize
        if (!this._initPromise) {
            return
        }

        this._initPromise.then(() => {
            return this._neovim.request("nvim_ui_try_resize", [columns, rows])
        })
    }

    private _getSize() {
        const rows = Math.floor(this._lastHeightInPixels / this._fontHeightInPixels)
        const cols = Math.floor(this._lastWidthInPixels / this._fontWidthInPixels)
        return { rows, cols }
    }

    private _handleNotification(_method: any, args: any): void {
        args.forEach((a: any[]) => {
            const command = a[0]
            a = a.slice(1)

            switch (command) {
                case "cursor_goto":
                    this.emit("action", Actions.createCursorGotoAction(a[0][0], a[0][1]))
                    break
                case "put":
                    const charactersToPut = a.map((v) => v[0])
                    this.emit("action", Actions.put(charactersToPut))
                    break
                case "set_scroll_region":
                    const param = a[0]
                    this.emit("action", Actions.setScrollRegion(param[0], param[1], param[2], param[3]))
                    break
                case "scroll":
                    this.emit("action", Actions.scroll(a[0][0]))
                    break
                case "highlight_set":
                    const highlightInfo = a[a.length - 1][0]
                    this.emit("action", Actions.setHighlight(
                        !!highlightInfo.bold,
                        !!highlightInfo.italic,
                        !!highlightInfo.reverse,
                        !!highlightInfo.underline,
                        !!highlightInfo.undercurl,
                        highlightInfo.foreground,
                        highlightInfo.background,
                    ))
                    break
                case "resize":
                    this.emit("action", Actions.resize(a[0][0], a[0][1]))
                    break
                case "set_title":
                    this.emit("set-title", a[0][0])
                    break
                case "set_icon":
                    // window title when minimized, no-op
                    break
                case "eol_clear":
                    this.emit("action", Actions.clearToEndOfLine())
                    break
                case "clear":
                    this.emit("action", Actions.clear())
                    break
                case "mouse_on":
                    // TODO
                    break
                case "update_bg":
                    this.emit("action", Actions.updateBackground(a[0][0]))
                    break
                case "update_fg":
                    this.emit("action", Actions.updateForeground(a[0][0]))
                    break
                case "mode_change":
                    const newMode = a[a.length - 1][0]
                    this.emit("action", Actions.changeMode(newMode))
                    this.emit("mode-change", newMode)
                    break
                case "popupmenu_hide":
                    this.emit("hide-popup-menu")
                    break
                case "popupmenu_show":
                    const completions = a[0][0]
                    this.emit("show-popup-menu", completions)
                    break
                case "tabline_update":
                    const [currentTab, tabs] = a[0]
                    const mappedTabs: any = tabs.map((t: any) => ({
                        id: t.tab.id,
                        name: t.name,
                    }))
                    this.emit("tabline-update", currentTab.id, mappedTabs)
                    break
                case "bell":
                    const bellUrl = this._config.getValue("oni.audio.bellUrl")
                    if (bellUrl) {
                        const audio = new Audio(bellUrl)
                        audio.play()
                    }
                    break
                default:
                    Log.warn("Unhandled command: " + command)
            }
        })
    }

    private async _onFullBufferUpdate(context: Oni.EventContext, startRange: number, endRange: number): Promise<void> {

        const buffer = new Buffer(context.bufferNumber as any, this._neovim)

        if (endRange > MAX_LINES_FOR_BUFFER_UPDATE) {
            return
        }

        const bufferLines = await buffer.getLines(startRange - 1, endRange, false)

        this._onFullBufferUpdateEvent.dispatch({
            context,
            bufferLines,
        })
    }

    private async _updateProcessDirectory(): Promise<void> {
        const newDirectory = await this.getCurrentWorkingDirectory()
        process.chdir(newDirectory)
        this.emit("directory-changed", newDirectory)
    }

    private async _attachUI(columns: number, rows: number): Promise<void> {
        const version = await this.getApiVersion()
        console.log(`Neovim version reported as ${version.major}.${version.minor}.${version.patch}`) // tslint:disable-line no-console

        const startupOptions = this._getStartupOptionsForVersion(version.major, version.minor, version.patch)

        await this._neovim.request("nvim_ui_attach", [columns, rows, startupOptions])
    }

    private _getStartupOptionsForVersion(major: number, minor: number, patch: number) {
        if (major >= 0 && minor >= 2 && patch >= 1) {
            return {
                rgb: true,
                popupmenu_external: true,
                ext_tabline: true,
            }
        } else if (major === 0 && minor === 2) {
            // 0.1 and below does not support external tabline
            // See #579 for more info on the manifestation.
            return {
                rgb: true,
                popupmenu_external: true,
            }
        } else {
            throw new Error("Unsupported version of Neovim.")
        }
    }
}
