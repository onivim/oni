import { EventEmitter } from "events"
import * as path from "path"

import * as Color from "color"
import * as mkdirp from "mkdirp"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import * as Log from "./../Log"
import * as Performance from "./../Performance"
import { EventContext } from "./EventContext"

import { addDefaultUnitIfNeeded, measureFont } from "./../Font"
import * as Platform from "./../Platform"
import { Configuration } from "./../Services/Configuration"
import { ITokenColorsSetting } from "./../Services/Configuration"

import * as Actions from "./actions"
import { NeovimBufferReference } from "./MsgPack"
import { INeovimAutoCommands, NeovimAutoCommands } from "./NeovimAutoCommands"
import { INeovimMarks, NeovimMarks } from "./NeovimMarks"
import { INeovimStartOptions, startNeovim } from "./NeovimProcessSpawner"
import { IQuickFixList, QuickFixList } from "./QuickFix"
import { IPixelPosition, IPosition } from "./Screen"
import { Session } from "./Session"

import { INeovimBufferUpdate, NeovimBufferUpdateManager } from "./NeovimBufferUpdateManager"

import { PromiseQueue } from "./../Services/Language/PromiseQueue"

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
    context: EventContext
    bufferLines: string[]
}

export interface IIncrementalBufferUpdateEvent {
    context: EventContext
    lineNumber: number
    lineContents: string
}

export interface INeovimCompletionItem {
    word: string
    kind: string
    menu: string
    info: string
}

export interface INeovimCompletionInfo {
    items: INeovimCompletionItem[]
    selectedIndex: number
    row: number
    col: number
}

export type CommandLineContent = [any, string]

export interface INeovimCommandLineShowEvent {
    content: CommandLineContent[]
    pos: number
    firstc: string
    prompt: string
    indent: number
    level: number
}

export interface IWildMenuShowEvent {
    options: string[]
}

export interface IWildMenuSelectEvent {
    selected: any
}

export interface INeovimCommandLineSetCursorPosition {
    pos: number
    level: number
}

interface IHighlight {
    fallback?: string
    foreground: number
    background?: number
    bold?: boolean
    italic?: boolean
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

    onBufferUpdate: IEvent<INeovimBufferUpdate>

    onRedrawComplete: IEvent<void>

    onScroll: IEvent<EventContext>

    onTitleChanged: IEvent<string>

    // When an OniCommand is requested, ie :OniCommand("quickOpen.show")
    onOniCommand: IEvent<string>

    onHidePopupMenu: IEvent<void>
    onShowPopupMenu: IEvent<INeovimCompletionInfo>

    onColorsChanged: IEvent<void>

    onCommandLineShow: IEvent<INeovimCommandLineShowEvent>
    onCommandLineHide: IEvent<void>
    onCommandLineSetCursorPosition: IEvent<INeovimCommandLineSetCursorPosition>

    autoCommands: INeovimAutoCommands
    marks: INeovimMarks

    screenToPixels(row: number, col: number): IPixelPosition

    /**
     * Supply input (keyboard/mouse) to Neovim
     */
    input(inputString: string): Promise<void>

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

    getApiVersion(): Promise<INeovimApiVersion>

    open(fileName: string): Promise<void>
    openInitVim(): Promise<void>
}

/**
 * Integration with NeoVim API
 */
export class NeovimInstance extends EventEmitter implements INeovimInstance {
    private _neovim: Session
    private _initPromise: Promise<void>
    private _isLeaving: boolean

    private _inputQueue: PromiseQueue = new PromiseQueue()

    private _configuration: Configuration
    private _autoCommands: NeovimAutoCommands

    private _fontFamily: string
    private _fontSize: string
    private _fontWidthInPixels: number
    private _fontHeightInPixels: number

    private _lastHeightInPixels: number
    private _lastWidthInPixels: number

    private _rows: number
    private _cols: number

    private _quickFix: QuickFixList
    private _marks: NeovimMarks
    private _initComplete: boolean

    private _onDirectoryChanged = new Event<string>()
    private _onErrorEvent = new Event<Error | string>()
    private _onYank = new Event<INeovimYankInfo>()
    private _onOniCommand = new Event<string>()
    private _onRedrawComplete = new Event<void>()
    private _onScroll = new Event<EventContext>()
    private _onTitleChanged = new Event<string>()
    private _onModeChanged = new Event<Oni.Vim.Mode>()
    private _onHidePopupMenu = new Event<void>()
    private _onShowPopupMenu = new Event<INeovimCompletionInfo>()
    private _onSelectPopupMenu = new Event<number>()
    private _onLeave = new Event<void>()

    private _onColorsChanged = new Event<void>()

    private _onCommandLineShowEvent = new Event<INeovimCommandLineShowEvent>()
    private _onCommandLineHideEvent = new Event<void>()
    private _onCommandLineSetCursorPositionEvent = new Event<INeovimCommandLineSetCursorPosition>()
    private _onWildMenuHideEvent = new Event<void>()
    private _onWildMenuSelectEvent = new Event<IWildMenuSelectEvent>()
    private _onWildMenuShowEvent = new Event<IWildMenuShowEvent>()
    private _bufferUpdateManager: NeovimBufferUpdateManager

    private _pendingScrollTimeout: number | null = null

    public get isInitialized(): boolean {
        return this._initComplete
    }

    public get quickFix(): IQuickFixList {
        return this._quickFix
    }

    public get onBufferUpdate(): IEvent<INeovimBufferUpdate> {
        return this._bufferUpdateManager.onBufferUpdate
    }

    public get onColorsChanged(): IEvent<void> {
        return this._onColorsChanged
    }

    public get onDirectoryChanged(): IEvent<string> {
        return this._onDirectoryChanged
    }

    public get onError(): IEvent<Error | string> {
        return this._onErrorEvent
    }

    public get onLeave(): IEvent<void> {
        return this._onLeave
    }

    public get onModeChanged(): IEvent<Oni.Vim.Mode> {
        return this._onModeChanged
    }

    public get onOniCommand(): IEvent<string> {
        return this._onOniCommand
    }

    public get onRedrawComplete(): IEvent<void> {
        return this._onRedrawComplete
    }

    public get onScroll(): IEvent<EventContext> {
        return this._onScroll
    }

    public get onTitleChanged(): IEvent<string> {
        return this._onTitleChanged
    }

    public get onHidePopupMenu(): IEvent<void> {
        return this._onHidePopupMenu
    }

    public get onSelectPopupMenu(): IEvent<number> {
        return this._onSelectPopupMenu
    }

    public get onShowPopupMenu(): IEvent<INeovimCompletionInfo> {
        return this._onShowPopupMenu
    }

    public get onCommandLineShow(): IEvent<INeovimCommandLineShowEvent> {
        return this._onCommandLineShowEvent
    }

    public get onCommandLineHide(): IEvent<void> {
        return this._onCommandLineHideEvent
    }

    public get onCommandLineSetCursorPosition(): IEvent<INeovimCommandLineSetCursorPosition> {
        return this._onCommandLineSetCursorPositionEvent
    }

    public get onWildMenuShow(): IEvent<IWildMenuShowEvent> {
        return this._onWildMenuShowEvent
    }

    public get onWildMenuSelect(): IEvent<IWildMenuSelectEvent> {
        return this._onWildMenuSelectEvent
    }

    public get onWildMenuHide(): IEvent<void> {
        return this._onWildMenuHideEvent
    }

    public get onYank(): IEvent<INeovimYankInfo> {
        return this._onYank
    }

    public get autoCommands(): INeovimAutoCommands {
        return this._autoCommands
    }

    public get marks(): INeovimMarks {
        return this._marks
    }

    constructor(widthInPixels: number, heightInPixels: number, configuration: Configuration) {
        super()
        this._configuration = configuration
        this._fontFamily = this._configuration.getValue("editor.fontFamily")
        this._fontSize = addDefaultUnitIfNeeded(this._configuration.getValue("editor.fontSize"))

        this._lastWidthInPixels = widthInPixels
        this._lastHeightInPixels = heightInPixels

        this._quickFix = new QuickFixList(this)
        this._autoCommands = new NeovimAutoCommands(this)
        this._marks = new NeovimMarks(this)

        this._bufferUpdateManager = new NeovimBufferUpdateManager(this._configuration, this)
    }

    public async chdir(directoryPath: string): Promise<void> {
        await this.command(`cd! ${directoryPath}`)
    }

    // Make a direct request against the msgpack API
    public async request<T>(request: string, args: any[]): Promise<T> {
        return this._neovim.request<T>(request, args)
    }

    public async getContext(): Promise<EventContext> {
        return this.callFunction("OniGetContext", [])
    }

    public start(startOptions?: INeovimStartOptions): Promise<void> {
        Performance.startMeasure("NeovimInstance.Start")
        this._initPromise = startNeovim(startOptions).then(nv => {
            Log.info("NeovimInstance: Neovim started")

            // Workaround for issue where UI
            // can fail to attach if there is a UI-blocking error
            // nv.input("<ESC>")

            this._neovim = nv

            this._neovim.on("error", (err: Error) => {
                this._onError(err)
            })

            this._neovim.on("notification", (method: any, args: any) => {
                if (method === "redraw") {
                    this._handleNotification(method, args)
                    this._onRedrawComplete.dispatch()
                } else if (method === "oni_plugin_notify") {
                    const pluginArgs = args[0]
                    const pluginMethod = pluginArgs.shift()

                    // TODO: Update pluginManager to subscribe from event here, instead of dupliating this

                    if (pluginMethod === "buffer_update") {
                        const eventContext: EventContext = args[0][0]

                        this._bufferUpdateManager.notifyFullBufferUpdate(eventContext)
                    } else if (pluginMethod === "oni_yank") {
                        this._onYank.dispatch(args[0][0])
                    } else if (pluginMethod === "oni_command") {
                        this._onOniCommand.dispatch(args[0][0])
                    } else if (pluginMethod === "event") {
                        const eventName = args[0][0]
                        const eventContext = args[0][1]

                        if (eventName === "DirChanged") {
                            this._updateProcessDirectory()
                        } else if (eventName === "VimLeave") {
                            this._isLeaving = true
                            this._onLeave.dispatch()
                        } else if (eventName === "ColorScheme") {
                            this._onColorsChanged.dispatch()
                        }

                        this._autoCommands.notifyAutocommand(eventName, eventContext)

                        this.emit("event", eventName, eventContext)
                    } else if (pluginMethod === "incremental_buffer_update") {
                        const eventContext = args[0][0]
                        const lineContents = args[0][1]
                        const lineNumber = args[0][2]

                        this._bufferUpdateManager.notifyIncrementalBufferUpdate(
                            eventContext,
                            lineNumber,
                            lineContents,
                        )
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
                if (!this._isLeaving) {
                    this._onError(
                        "Neovim disconnected. This likely means that the Neovim process crashed.",
                    )
                }
            })

            const size = this._getSize()
            this._rows = size.rows
            this._cols = size.cols

            // Workaround for bug in neovim/node-client
            // The 'uiAttach' method overrides the new 'nvim_ui_attach' method
            Performance.startMeasure("NeovimInstance.Start.Attach")
            return this._attachUI(size.cols, size.rows).then(
                async () => {
                    Log.info("Attach success")
                    Performance.endMeasure("NeovimInstance.Start.Attach")

                    // TODO: #702 - Batch these calls via `nvim_call_atomic`
                    // Override completeopt so Oni works correctly with external popupmenu
                    // await this.command("set completeopt=longest,menu")

                    // set title after attaching listeners so we can get the initial title
                    await this.command("set title")

                    Performance.endMeasure("NeovimInstance.Start")

                    this._initComplete = true
                },
                (err: any) => {
                    this._onError(err)
                    this._initComplete = true
                },
            )
        })

        return this._initPromise
    }

    public setFont(fontFamily: string, fontSize: string, linePadding: number): void {
        this._fontFamily = fontFamily
        this._fontSize = fontSize

        const { width, height, isBoldAvailable, isItalicAvailable } = measureFont(
            this._fontFamily,
            this._fontSize,
        )

        this._fontWidthInPixels = width
        this._fontHeightInPixels = height + linePadding

        this.emit(
            "action",
            Actions.setFont({
                fontFamily,
                fontSize,
                fontWidthInPixels: width,
                fontHeightInPixels: height + linePadding,
                linePaddingInPixels: linePadding,
                isItalicAvailable,
                isBoldAvailable,
            }),
        )

        this.resize(this._lastWidthInPixels, this._lastHeightInPixels)
    }

    public open(fileName: string): Promise<void> {
        return this.command(`e! ${fileName}`)
    }

    public openInitVim(): Promise<void> {
        const loadInitVim = this._configuration.getValue("oni.loadInitVim")

        if (typeof loadInitVim === "string") {
            return this.open(loadInitVim)
        } else {
            // Use path from: https://github.com/neovim/neovim/wiki/FAQ
            const rootFolder = Platform.isWindows()
                ? path.join(process.env["LOCALAPPDATA"], "nvim") // tslint:disable-line no-string-literal
                : path.join(Platform.getUserHome(), ".config", "nvim")

            mkdirp.sync(rootFolder)
            const initVimPath = path.join(rootFolder, "init.vim")

            return this.open(initVimPath)
        }
    }

    public eval<T>(expression: string): Promise<T> {
        return this._neovim.request("nvim_eval", [expression])
    }

    public command(command: string): Promise<any> {
        // await this._initPromise
        Log.verbose("[NeovimInstance] Executing command: " + command)
        return this._neovim.request<any>("nvim_command", [command])
    }

    public callFunction(functionName: string, args: any[]): Promise<any> {
        return this._neovim.request<void>("nvim_call_function", [functionName, args])
    }

    public async getBufferIds(): Promise<number[]> {
        const buffers = await this._neovim.request<NeovimBufferReference[]>("nvim_list_bufs", [])

        return buffers.map(b => b.id as any)
    }

    public async getCurrentWorkingDirectory(): Promise<string> {
        const currentWorkingDirectory = await this.eval<string>("getcwd()")
        return path.normalize(currentWorkingDirectory)
    }

    public async getVimHighlights(): Promise<ITokenColorsSetting[]> {
        const highlights = [
            "identifier",
            "function",
            "constant",
            "preproc",
            "type",
            "foldbraces",
            "define",
            "keyword",
            "statement",
            "comment",
            "normal",
        ]

        const colorValues = await Promise.all(
            highlights.map(async token => {
                const highlight = (await this._neovim.request("nvim_get_hl_by_name", [
                    token,
                    true,
                ])) as IHighlight
                const highlightOrDefault = (color: number) => (color ? Color(color).hex() : null)
                const { bold, foreground, background, italic } = highlight

                return {
                    scope: token,
                    settings: {
                        fallback: token,
                        italic,
                        bold,
                        foreground: highlightOrDefault(foreground),
                        background: highlightOrDefault(background),
                    },
                }
            }),
        )
        return colorValues
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
        return this._inputQueue.enqueuePromise(async () => {
            await this._neovim.request("nvim_input", [inputString])
        })
    }

    public blockInput(func: (opt?: any) => Promise<void>): void {
        const forceInput = (inputString: string) => {
            return this._neovim.request("nvim_input", [inputString])
        }

        this._inputQueue.enqueuePromise(async () => {
            await func(forceInput)
        })
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

    public dispatchScrollEvent(): void {
        if (this._pendingScrollTimeout) {
            return
        }

        this._pendingScrollTimeout = window.setTimeout(async () => {
            const evt = await this.getContext()
            this._onScroll.dispatch(evt)
            this._pendingScrollTimeout = null
        })
    }

    private _resizeInternal(rows: number, columns: number): void {
        if (this._configuration.hasValue("debug.fixedSize")) {
            const fixedSize = this._configuration.getValue("debug.fixedSize")
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
                    const charactersToPut = a.map(v => v[0])
                    this.emit("action", Actions.put(charactersToPut))
                    break
                case "set_scroll_region":
                    const param = a[0]
                    this.emit(
                        "action",
                        Actions.setScrollRegion(param[0], param[1], param[2], param[3]),
                    )
                    break
                case "scroll":
                    this.emit("action", Actions.scroll(a[0][0]))
                    break
                case "highlight_set":
                    const highlightInfo = a[a.length - 1][0]

                    this.emit(
                        "action",
                        Actions.setHighlight(
                            !!highlightInfo.bold,
                            !!highlightInfo.italic,
                            !!highlightInfo.reverse,
                            !!highlightInfo.underline,
                            !!highlightInfo.undercurl,
                            highlightInfo.foreground,
                            highlightInfo.background,
                        ),
                    )
                    break
                case "resize":
                    this.emit("action", Actions.resize(a[0][0], a[0][1]))
                    break
                case "set_title":
                    this._onTitleChanged.dispatch(a[0][0])
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
                    this._onModeChanged.dispatch(newMode as Oni.Vim.Mode)
                    break
                case "popupmenu_select":
                    this._onSelectPopupMenu.dispatch(a[0][0])
                    break
                case "popupmenu_hide":
                    this._onHidePopupMenu.dispatch()
                    break
                case "popupmenu_show":
                    const [items, selected, row, col] = a[0]

                    const mappedItems = items.map((item: string[]) => {
                        const [word, kind, menu, info] = item
                        return {
                            word,
                            kind,
                            menu,
                            info,
                        }
                    })

                    const completionInfo: INeovimCompletionInfo = {
                        items: mappedItems,
                        selectedIndex: selected,
                        row,
                        col,
                    }

                    this._onShowPopupMenu.dispatch(completionInfo)
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
                    const bellUrl = this._configuration.getValue("oni.audio.bellUrl")
                    if (bellUrl) {
                        const audio = new Audio(bellUrl)
                        audio.play()
                    }
                    break
                case "cmdline_show":
                    {
                        const [content, pos, firstc, prompt, indent, level] = a[0]
                        const commandLineShowInfo: INeovimCommandLineShowEvent = {
                            content,
                            pos,
                            firstc,
                            prompt,
                            indent,
                            level,
                        }
                        this._onCommandLineShowEvent.dispatch(commandLineShowInfo)
                    }
                    break
                case "cmdline_pos":
                    {
                        const [pos, level] = a[0]
                        const commandLinePositionInfo: INeovimCommandLineSetCursorPosition = {
                            pos,
                            level,
                        }
                        this._onCommandLineSetCursorPositionEvent.dispatch(commandLinePositionInfo)
                    }
                    break
                case "cmdline_hide":
                    this._onCommandLineHideEvent.dispatch()
                    break
                case "wildmenu_show":
                    const [[options]] = a
                    this._onWildMenuShowEvent.dispatch({ options })
                    break
                case "wildmenu_select":
                    const [[selection]] = a
                    this._onWildMenuSelectEvent.dispatch({ selected: selection })
                    break
                case "wildmenu_hide":
                    this._onWildMenuHideEvent.dispatch()
                    break
                default:
                    Log.warn("Unhandled command: " + command)
            }
        })
    }

    private _onError(error: Error | string): void {
        Log.error(error)
        this._onErrorEvent.dispatch(error)
    }

    private async _updateProcessDirectory(): Promise<void> {
        const newDirectory = await this.getCurrentWorkingDirectory()
        this._onDirectoryChanged.dispatch(newDirectory)
    }

    private async _attachUI(columns: number, rows: number): Promise<void> {
        const version = await this.getApiVersion()

        const useNativeTabs = this._configuration.getValue("tabs.mode") === "native"
        const useNativePopupWindows =
            this._configuration.getValue("editor.completions.mode") === "native"

        const externaliseTabline = !useNativeTabs
        const externalisePopupWindows = !useNativePopupWindows

        console.log(`Neovim version reported as ${version.major}.${version.minor}.${version.patch}`) // tslint:disable-line no-console

        const startupOptions = this._getStartupOptionsForVersion(
            version.major,
            version.minor,
            version.patch,
            externaliseTabline,
            externalisePopupWindows,
        )

        await this._neovim.request("nvim_ui_attach", [columns, rows, startupOptions])
    }

    private _getStartupOptionsForVersion(
        major: number,
        minor: number,
        patch: number,
        shouldExtTabs: boolean,
        shouldExtPopups: boolean,
    ) {
        if (major >= 0 && minor >= 2 && patch >= 1) {
            const useExtCmdLine = this._configuration.getValue("experimental.commandline.mode")
            const useExtWildMenu = this._configuration.getValue("experimental.wildmenu.mode")
            return {
                rgb: true,
                popupmenu_external: shouldExtPopups,
                ext_tabline: shouldExtTabs,
                ext_cmdline: useExtCmdLine,
                ext_wildmenu: useExtWildMenu,
            }
        } else if (major === 0 && minor === 2) {
            // 0.1 and below does not support external tabline
            // See #579 for more info on the manifestation.
            return {
                rgb: true,
                popupmenu_external: shouldExtPopups,
            }
        } else {
            throw new Error("Unsupported version of Neovim.")
        }
    }
}
