import * as os from "os"
import * as path from "path"
import * as fs from "fs"
import { EventEmitter } from "events"

import { remote } from "electron"
import { ipcRenderer } from "electron"

import * as Q from "q"
import * as mkdirp from "mkdirp"

import * as Config from "./../Config"
import { INeovimInstance } from "./../NeovimInstance"
import { 
    EvaluateBlockCapability, 
    FormatCapability,
    QuickInfoCapability,
    GotoDefinitionCapability,
    CompletionProviderCapability,
    Plugin } from "./Plugin"
import { Screen } from "./../Screen"

import * as UI from "./../UI/index"
import { OverlayManager } from "./../UI/OverlayManager"
import { ErrorOverlay } from "./../UI/Overlay/ErrorOverlay"

const initFilePath = path.join(__dirname, "vim", "init_template.vim")

const builtInPluginsRoot = path.join(__dirname, "vim", "vimfiles")

const webcontents = remote.getCurrentWindow().webContents

const BrowserId = webcontents.id

export interface BufferInfo {
    lines: string[]
    version: number
    fileName: string
}

export class PluginManager extends EventEmitter {

    private _debugPluginPath: string
    private _rootPluginPaths: string[] = []
    private _extensionPath: string
    private _plugins: Plugin[] = []
    private _neovimInstance: INeovimInstance
    private _overlayManager: OverlayManager

    private _errorOverlay: ErrorOverlay
    private _lastEventContext: any
    private _lastBufferInfo: BufferInfo

    constructor(screen: Screen, debugPlugin?: string) {
        super()

        this._debugPluginPath = debugPlugin

        this._rootPluginPaths.push(builtInPluginsRoot)
        this._rootPluginPaths.push(path.join(builtInPluginsRoot, "bundle"))

        if (Config.getValue<boolean>("vim.loadVimPlugins")) {
            var userRoot = path.join(os.homedir(), "vimfiles", "bundle")

            if (fs.existsSync(userRoot)) {
                this._rootPluginPaths.push(userRoot)
            }
        }

        this._extensionPath = this._ensureOniPluginsPath()
        this._rootPluginPaths.push(this._extensionPath)

        ipcRenderer.on("cross-browser-ipc", (event, arg) => {
            console.log("cross-browser-ipc: " + JSON.stringify(arg));
            this._handlePluginResponse(arg);
        })

        this._overlayManager = new OverlayManager(screen)
        this._errorOverlay = new ErrorOverlay()
        this._overlayManager.addOverlay("errors", this._errorOverlay)

        window.onbeforeunload = () => {
            this.dispose()
        }

    }

    public dispose(): void {
        this._plugins.forEach(p => p.dispose())
    }

    public get currentBuffer(): BufferInfo {
        return this._lastBufferInfo
    }

    public executeCommand(command: string): void {
        if (command === "editor.gotoDefinition") {
            const plugin = this._getFirstPluginThatHasCapability(this._lastEventContext.filetype, GotoDefinitionCapability)
            if (plugin) {
                plugin.requestGotoDefinition(this._lastEventContext)
            }
        }
    }

    public handleNotification(method: string, args: any[]): void {
        if (method === "buffer_update") {
            const eventContext = args[0][0]
            const bufferLines = args[0][1]
            this._lastBufferInfo = {
                lines: bufferLines,
                fileName: eventContext.bufferFullPath,
                version: eventContext.version
            }

            this._plugins
                .filter(p => p.isPluginSubscribedToBufferUpdates(eventContext.filetype) || p.isPluginSubscribedToBufferUpdates("*"))
                .forEach((plugin) => plugin.notifyBufferUpdateEvent(eventContext, bufferLines))

        } else if (method === "event") {
            const eventName = args[0][0]
            const eventContext = args[0][1]

            this._lastEventContext = eventContext

            this._plugins
                .filter(p => p.isPluginSubscribedToVimEvents(eventContext.filetype) || p.isPluginSubscribedToVimEvents("*"))
                .forEach((plugin) => plugin.notifyVimEvent(eventName, eventContext))

            this._overlayManager.handleCursorMovedEvent(eventContext)
            this._errorOverlay.onVimEvent(eventName, eventContext)

            if (eventName === "CursorMoved" && Config.getValue<boolean>("editor.quickInfo.enabled")) {
                const plugin = this._getFirstPluginThatHasCapability(eventContext.filetype, QuickInfoCapability)

                if (plugin) {
                    plugin.requestQuickInfo(eventContext)
                }
            } else if (eventName === "CursorMovedI" && Config.getValue<boolean>("editor.completions.enabled")) {
                const plugin = this._getFirstPluginThatHasCapability(eventContext.filetype, CompletionProviderCapability)

                if (plugin) {
                    plugin.requestCompletions(eventContext)
                }
            }

        } else if (method === "window_display_update") {
            this._overlayManager.notifyWindowDimensionsChanged(args[0][1])
        }
    }

    public requestFormat(): void {
        const plugin = this._getFirstPluginThatHasCapability(this._lastEventContext.filetype, FormatCapability)

        if (plugin) {
            plugin.requestFormat(this._lastEventContext)
        }
    }

    public requestEvaluateBlock(code: string): void {
        const plugin = this._getFirstPluginThatHasCapability(this._lastEventContext.filetype, EvaluateBlockCapability)

        if (plugin) {
            plugin.requestEvaluateBlock(this._lastEventContext, code)
        }
    }

    private _getFirstPluginThatHasCapability(filetype: string, capability: string): Plugin {
        const handlers = this._plugins.filter(p => p.doesPluginProvideLanguageServiceCapability(filetype, capability))

        if (handlers.length > 0) {
            return handlers[0]
        }

        const defaultHandlers = this._plugins.filter(p => p.doesPluginProvideLanguageServiceCapability("*", capability))

        if (defaultHandlers.length > 0)
            return defaultHandlers[0]

        return null
    }

    public notifyCompletionItemSelected(completionItem: any) {
        // TODO: Scope this to the plugin that is providing completion
        this._plugins.forEach((plugin) => plugin.notifyCompletionItemSelected(completionItem))
    }

    private _handlePluginResponse(pluginResponse: any): void {
        if (pluginResponse.type === "show-quick-info") {
            if (!this._validateOriginEventMatchesCurrentEvent(pluginResponse))
                return

            setTimeout(() => UI.showQuickInfo(pluginResponse.payload.info, pluginResponse.payload.documentation), 50)
        } else if (pluginResponse.type === "goto-definition") {
            if (!this._validateOriginEventMatchesCurrentEvent(pluginResponse))
                return

            const { filePath, line, column } = pluginResponse.payload
            this._neovimInstance.command("e! " + filePath)
            this._neovimInstance.command("keepjumps norm " + line + "G" + column)
            this._neovimInstance.command("norm zz")
        } else if (pluginResponse.type === "completion-provider") {
            if (!this._validateOriginEventMatchesCurrentEvent(pluginResponse))
                return

            setTimeout(() => UI.showCompletions(pluginResponse.payload))
        } else if (pluginResponse.type === "completion-provider-item-selected") {
            setTimeout(() => UI.setDetailedCompletionEntry(pluginResponse.payload.details))
        } else if (pluginResponse.type === "set-errors") {
            this._errorOverlay.setErrors(pluginResponse.payload.key, pluginResponse.payload.fileName, pluginResponse.payload.errors, pluginResponse.payload.colors)
        } else if (pluginResponse.type === "format") {
            this.emit("format", pluginResponse.payload)
        } else if (pluginResponse.type === "execute-shell-command") {
            // TODO: Check plugin permission
            this.emit("execute-shell-command", pluginResponse.payload)
        } else if (pluginResponse.type === "evaluate-block-result") {
            this.emit("evaluate-block-result", pluginResponse.payload)
        } else if(pluginResponse.type === "set-syntax-highlights") {
            this.emit("set-syntax-highlights", pluginResponse.payload)
        } else if(pluginResponse.type === "clear-syntax-highlights") {
            this.emit("clear-syntax-highlights", pluginResponse.payload)
        }

    }

    /**
     * Validate that the originating event matched the initating event
     */
    private _validateOriginEventMatchesCurrentEvent(pluginResponse: any): boolean {
        const currentEvent = this._lastEventContext
        const originEvent = pluginResponse.meta.originEvent

        if (originEvent.bufferFullPath === currentEvent.bufferFullPath
            && originEvent.line === currentEvent.line
            && originEvent.column === currentEvent.column) {
            return true
        } else {
            console.log("Plugin response aborted as it didn't match current even (buffer/line/col)")
            return false
        }
    }


    public startPlugins(neovimInstance: INeovimInstance): void {
        this._neovimInstance = neovimInstance
        const allPlugins = this._getAllPluginPaths()
        this._plugins = allPlugins.map(pluginRootDirectory => new Plugin(pluginRootDirectory))

        if (this._debugPluginPath) {
            this._plugins.push(new Plugin(this._debugPluginPath, true))
        }
    }

    private _ensureOniPluginsPath(): string {
        var rootOniPluginsDir = path.join(os.homedir(), ".oni", "extensions")

        mkdirp.sync(rootOniPluginsDir)
        return rootOniPluginsDir
    }

    public generateInitVim(): string {
        var contents = fs.readFileSync(initFilePath, "utf8")

        const paths = this._getAllRuntimePaths()
        contents = contents.replace("${runtimepaths}", "set rtp+=" + paths.join(","))
        var destDir = path.join(os.tmpdir(), "init.vim")
        fs.writeFileSync(destDir, contents, "utf8")

        console.log("init.vim written to: " + destDir)

        return destDir
    }

    private _getAllRuntimePaths(): string[] {
        var pluginPaths = this._getAllPluginPaths()

        return pluginPaths.concat(this._rootPluginPaths)
    }

    private _getAllPluginPaths(): string[] {

        var paths = []
        this._rootPluginPaths.forEach(rp => {
            const subPaths = getDirectories(rp)
            paths = paths.concat(subPaths)
        })

        return paths
    }
}

function getDirectories(rootPath) {
    return fs.readdirSync(rootPath)
        .map(f => path.join(rootPath, f))
        .filter(f => fs.statSync(f).isDirectory())
}
