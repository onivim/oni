import * as cp from "child_process"
import { remote } from "electron"
import { EventEmitter } from "events"
import * as path from "path"

import * as Actions from "./actions"
import * as Config from "./Config"
import { measureFont } from "./Font"
import { Buffer, IBuffer } from "./neovim/Buffer"
import { IQuickFixList, QuickFixList } from "./neovim/QuickFix"
import { SessionWrapper } from "./neovim/SessionWrapper"
import { IWindow, Window } from "./neovim/Window"
import * as Platform from "./Platform"
import { PluginManager } from "./Plugins/PluginManager"
import { IPixelPosition, IPosition } from "./Screen"

export interface INeovimInstance {
    cursorPosition: IPosition
    quickFix: IQuickFixList
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
     * Execute a VimL command
     */
    command(command: string): Promise<any>

    /**
     * Evaluate a VimL block
     */
    eval(expression: string): Promise<any>

    on(event: string, handler: Function): void

    setFont(fontFamily: string, fontSize: string): void

    getCurrentBuffer(): Promise<IBuffer>
    getCurrentWindow(): Promise<IWindow>

    getCursorColumn(): Promise<number>
    getCursorRow(): Promise<number>

    open(fileName: string): Promise<void>
}

/**
 * Integration with NeoVim API
 */
export class NeovimInstance extends EventEmitter implements INeovimInstance {
    private _neovim: any
    private _initPromise: any

    private _config = Config.instance()

    private _fontFamily: string = this._config.getValue("editor.fontFamily")
    private _fontSize: string = this._config.getValue("editor.fontSize")
    private _fontWidthInPixels: number
    private _fontHeightInPixels: number

    private _lastHeightInPixels: number
    private _lastWidthInPixels: number

    private _rows: number
    private _cols: number

    private _pluginManager: PluginManager
    private _sessionWrapper: SessionWrapper
    private _quickFix: QuickFixList

    public get quickFix(): IQuickFixList {
        return this._quickFix
    }

    constructor(pluginManager: PluginManager, widthInPixels: number, heightInPixels: number) {
        super()

        this._pluginManager = pluginManager

        this._lastWidthInPixels = widthInPixels
        this._lastHeightInPixels = heightInPixels
        this._quickFix = new QuickFixList(this)
    }

    public start(filesToOpen?: string[]): void {
        filesToOpen = filesToOpen || []

        this._initPromise = startNeovim(this._pluginManager.getAllRuntimePaths(), filesToOpen)
            .then((nv) => {
                this.emit("logInfo", "NeovimInstance: Neovim started")

                // Workaround for issue where UI
                // can fail to attach if there is a UI-blocking error
                // nv.input("<ESC>")

                this._neovim = nv

                this._sessionWrapper = new SessionWrapper(this._neovim)

                // Override completeopt so Oni works correctly with external popupmenu
                this.command("set completeopt=longest,menu")

                this._neovim.on("error", (err: Error) => {
                    this.emit("logError", err)
                })

                this._neovim.on("notification", (method: any, args: any) => {
                    if (method === "redraw") {
                        this._handleNotification(method, args)
                    } else if (method === "oni_plugin_notify") {
                        const pluginArgs = args[0]
                        const pluginMethod = pluginArgs.shift()

                        // TODO: Update pluginManager to subscribe from event here, instead of dupliating this

                        if (pluginMethod === "buffer_update") {
                            const eventContext = args[0][0]
                            const bufferLines = args[0][1]

                            this.emit("buffer-update", eventContext, bufferLines)
                        } else if (pluginMethod === "event") {
                            const eventName = args[0][0]
                            const eventContext = args[0][1]

                            this.emit("event", eventName, eventContext)
                        } else if (pluginMethod === "window_display_update") {
                            this.emit("window-display-update", args[0][0], args[0][1], args[0][2])
                        } else if (pluginMethod === "api_info") {
                            const apiVersion = args[0][0]
                            if (apiVersion.api_level < 1) {
                                alert("Please upgrade to at least Neovim 0.2.0")
                            }

                        } else {
                            this.emit("logWarning", "Unknown event from oni_plugin_notify: " + pluginMethod)
                        }
                    } else {
                        this.emit("logWarning", "Unknown notification: " + method)
                    }
                })

                this._neovim.on("request", (method: any, _args: any, _resp: any) => {
                    this.emit("logWarning", "Unhandled request: " + method)
                })

                this._neovim.on("disconnect", () => {
                    remote.getCurrentWindow().close()
                })

                const startupOptions = {
                    rgb: true,
                    popupmenu_external: true,
                }

                const size = this._getSize()
                this._rows = size.rows
                this._cols = size.cols

                // Workaround for bug in neovim/node-client
                // The 'uiAttach' method overrides the new 'nvim_ui_attach' method
                return this._neovim.request("vim_get_api_info", [])
                    .then((results?: any) => {
                        console.log(results)
                        debugger
                    })
                    .then(() => this._neovim.request("nvim_ui_attach", [size.cols, size.rows, startupOptions]))
                    .then(() => {
                        this.emit("logInfo", "Attach success")

                        performance.mark("NeovimInstance.Plugins.Start")
                        this._pluginManager.startPlugins(this)
                        performance.mark("NeovimInstance.Plugins.End")

                        // set title after attaching listeners so we can get the initial title
                        this.command("set title")
                        this.callFunction("OniConnect", [])
                    },
                    (err: any) => {
                        this.emit("error", err)
                    })
        })
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

    /**
     * Returns the current cursor row in buffer-space
     */
    public getCursorRow(): Promise<number> {
        return this.eval<number>("line('.')")
    }

    public setFont(fontFamily: string, fontSize: string): void {
        this._fontFamily = fontFamily
        this._fontSize = fontSize

        const {width, height} = measureFont(this._fontFamily, this._fontSize)

        this._fontWidthInPixels = width
        this._fontHeightInPixels = height

        this.emit("action", Actions.setFont(fontFamily, fontSize, width, height))

        this.resize(this._lastWidthInPixels, this._lastHeightInPixels)
    }

    public open(fileName: string): Promise<void> {
        return this.command(`e! ${fileName}`)
    }

    public eval<T>(expression: string): Promise<T> {
        return this._neovim.request("nvim_eval", [expression])
    }

    public command(command: string): Promise<void> {
        return this._neovim.request("nvim_command", [command])
    }

    public callFunction(functionName: string, args: any[]): Promise<void> {
        return this._neovim.request("nvim_call_function", [functionName, args])
    }

    public getCurrentBuffer(): Promise<IBuffer> {
        return this._neovim.request("nvim_get_current_buf", [])
            .then((bufferReference: msgpack.NeovimBufferReference) => {
                return new Buffer(bufferReference, this._neovim)
            })
    }

    public getCurrentWorkingDirectory(): Promise<string> {
        return this.eval("getcwd()")
                .then((currentWorkingDirectory: string) => path.normalize(currentWorkingDirectory))
    }

    public getCurrentWindow(): Promise<IWindow> {
        return this._neovim.request("nvim_get_current_win", [])
            .then((args1: msgpack.NeovimWindowReference) => {
                console.log(args1)
                return new Window(args1, this._neovim)
            })
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

    private _resizeInternal(rows: number, columns: number): void {

        if (this._config.hasValue("debug.fixedSize")) {
            const fixedSize = this._config.getValue("debug.fixedSize")
            rows = fixedSize.rows
            columns = fixedSize.columns
            this.emit("logWarning", "Overriding screen size based on debug.fixedSize")
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
            const command = a.shift()
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
            case "bell":
                const bellUrl = this._config.getValue("oni.audio.bellUrl")
                if (bellUrl) {
                    const audio = new Audio(bellUrl)
                    audio.play()
                }
                break
            default:
                this.emit("logWarning", "Unhandled command: " + command)
            }
        })
    }
}

import * as msgpack from "./neovim/MsgPack"

import * as msgpackLite from "msgpack-lite"

export class NeovimSession {
    private _encoder: any
    private _decoder: any
    private _requestId: number = 0

    private _pendingRequests: { [key: number]: Function } = {}

    private _messageHandlers: { [message: string]: Function[] } = {}

    constructor(writer: NodeJS.WritableStream, reader: NodeJS.ReadableStream) {

        const codec = msgpackLite.createCodec()

        codec.addExtPacker(0x01, msgpack.NeovimWindowReference, msgpack.Pack)
        codec.addExtUnpacker(0x01, msgpack.UnpackWindow)

        this._encoder = msgpackLite.createEncodeStream({ codec })
        this._decoder = msgpackLite.createDecodeStream({ codec })

        // reader.on("end", () => {
        //     console.warn("READER END")
        // })

        this._encoder.pipe(writer)
        
        reader.pipe(this._decoder)

        // pipey.on("data", (data: any) => {
        //     console.log("PIPEY--")
        //     console.dir(data)
        //     console.log("--PIPEY")
        // })

        // pipey.on("end", () => {
        //     console.warn("PIPEY END")
        // })

        this._decoder.on("data", (data: any) => {


            const type = data[0]

            switch(type) {
                case 0:
                    console.warn("Unhandled request")
                    break
                case 1 /* Response */:
                    const result = data[2] || data[3]
                    console["timeStamp"]("neovim.request." + data[1])
                    this._pendingRequests[data[1]](result)
                    break
                case 2:
                    const message = data[1]
                    const payload = data[2]

                    console["timeStamp"]("neovim.notification." + message)

                    if (this._messageHandlers["notification"]) {
                        const handlers = this._messageHandlers["notification"]
                        handlers.forEach(handler => handler(message, payload))
                    } else {
                        console.warn("Unhandled notification: " + message)
                    }
                    break

            }
        })

        this._decoder.on("end", () => {
            console.warn("DECODER END")
        })

        this._decoder.on("error", (err: Error) => {
            console.error("Decoder error!", err)
        })
    }

    public on(message: string, callback: any): void {
        const currentHandlers = this._messageHandlers[message] || []
        this._messageHandlers[message] = currentHandlers.concat(callback)
    }

    public request<T>(methodName: string, args: any): Promise<T> {
        // console.log("request")
        this._requestId++
            // const requestId = this._requestId
        let r
        const promise = new Promise<T>((resolve) => {
            r = (val: any) => {
                // console.log(`Completed request ${requestId} for ${methodName}`)
                resolve(val)
            }
        })

        this._pendingRequests[this._requestId] = r
        this._encoder.write([0, this._requestId, methodName, args])
        this._encoder._flush()

        return promise
        // this._encoder.end()
    }

    public notify(methodName: string, args: any) {
        // console.log("notify")
        this._encoder.write([2, methodName, args])
        this._encoder._flush()
    }
}

function startNeovim(runtimePaths: string[], args: any): Promise<any> {

    const noopInitVimPath = path.join(__dirname, "vim", "noop.vim")

    const nvimWindowsProcessPath = path.join(__dirname, "bin", "x86", "Neovim", "bin", "nvim.exe")
    const nvimMacProcessPath = path.join(__dirname, "bin", "osx", "neovim", "bin", "nvim")
    // For Linux, assume there is a locally installed neovim
    const nvimLinuxPath = "nvim"

    const nvimProcessPath = Platform.isWindows() ? nvimWindowsProcessPath : Platform.isMac() ? nvimMacProcessPath : nvimLinuxPath

    const joinedRuntimePaths = runtimePaths.join(",")

    const shouldLoadInitVim = Config.instance().getValue("oni.loadInitVim")
    const useDefaultConfig = Config.instance().getValue("oni.useDefaultConfig")

    const vimRcArg = (shouldLoadInitVim || !useDefaultConfig) ? [] : ["-u", noopInitVimPath]

    const argsToPass = vimRcArg
        .concat(["--cmd", `let &rtp.='${joinedRuntimePaths}'`, "--cmd", "let g:gui_oni = 1", "-N", "--embed", "--"])
        .concat(args)

    const nvimProc = cp.spawn(nvimProcessPath, argsToPass, {})
    console.log("NVIM PID: " + nvimProc.pid)

    return Promise.resolve(new NeovimSession(nvimProc.stdin, nvimProc.stdout))
}
