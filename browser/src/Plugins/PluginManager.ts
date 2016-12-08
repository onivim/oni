import { ipcRenderer } from "electron"
import { EventEmitter } from "events"
import * as fs from "fs"
import * as mkdirp from "mkdirp"
import * as os from "os"
import * as path from "path"
import * as Config from "./../Config"
import { INeovimInstance } from "./../NeovimInstance"
import { IScreen } from "./../Screen"
import * as UI from "./../UI/index"
import {
    CompletionProviderCapability,
    EvaluateBlockCapability,
    FormatCapability,
    GotoDefinitionCapability,
    Plugin,
    QuickInfoCapability,
    SignatureHelpCapability,
} from "./Plugin"

const corePluginsRoot = path.join(__dirname, "vim", "core")
const defaultPluginsRoot = path.join(__dirname, "vim", "default")

export interface IBufferInfo {
    lines: string[]
    version: number
    fileName: string
}

export class PluginManager extends EventEmitter {
    private _debugPluginPath: undefined | string
    private _rootPluginPaths: string[] = []
    private _extensionPath: string
    private _plugins: Plugin[] = []
    private _neovimInstance: INeovimInstance
    private _lastEventContext: any
    private _lastBufferInfo: IBufferInfo

    constructor(_screen: IScreen, debugPlugin?: string) {
        super()

        this._debugPluginPath = debugPlugin

        this._rootPluginPaths.push(corePluginsRoot)

        if (Config.getValue<boolean>("oni.useDefaultConfig")) {
            this._rootPluginPaths.push(defaultPluginsRoot)
            this._rootPluginPaths.push(path.join(defaultPluginsRoot, "bundle"))
        }

        this._extensionPath = this._ensureOniPluginsPath()
        this._rootPluginPaths.push(this._extensionPath)

        ipcRenderer.on("cross-browser-ipc", (_event, arg) => {
            console.log("cross-browser-ipc: " + JSON.stringify(arg)) // tslint:disable-line no-console
            this._handlePluginResponse(arg)
        })

        window.onbeforeunload = () => {
            this.dispose()
        }
    }

    public dispose(): void {
        this._plugins.forEach((p) => p.dispose())
    }

    public get currentBuffer(): IBufferInfo {
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

    public requestFormat(): void {
        const plugin = this._getFirstPluginThatHasCapability(this._lastEventContext.filetype, FormatCapability)

        if (plugin) {
            plugin.requestFormat(this._lastEventContext)
        }
    }

    public requestEvaluateBlock(id: string, fileName: string, code: string): void {
        const plugin = this._getFirstPluginThatHasCapability(this._lastEventContext.filetype, EvaluateBlockCapability)

        if (plugin) {
            plugin.requestEvaluateBlock(this._lastEventContext, id, fileName, code)
        }
    }

    public notifyCompletionItemSelected(completionItem: any): void {
        // TODO: Scope this to the plugin that is providing completion
        this._plugins.forEach((plugin) => plugin.notifyCompletionItemSelected(completionItem))
    }

    public startPlugins(neovimInstance: INeovimInstance): void {
        this._neovimInstance = neovimInstance

        this._neovimInstance.on("buffer-update", (args: Oni.EventContext, bufferLines: string[]) => {
            this._onBufferUpdate(args, bufferLines)
        })

        this._neovimInstance.on("event", (eventName: string, context: Oni.EventContext) => {
            this._onEvent(eventName, context)
        })

        const allPlugins = this._getAllPluginPaths()
        this._plugins = allPlugins.map((pluginRootDirectory) => new Plugin(pluginRootDirectory))

        if (this._debugPluginPath) {
            this._plugins.push(new Plugin(this._debugPluginPath, true))
        }
    }

    public getAllRuntimePaths(): string[] {
        const pluginPaths = this._getAllPluginPaths()

        return pluginPaths.concat(this._rootPluginPaths)
    }

    private _ensureOniPluginsPath(): string {
        const rootOniPluginsDir = path.join(os.homedir(), ".oni", "extensions")

        mkdirp.sync(rootOniPluginsDir)
        return rootOniPluginsDir
    }

    private _getAllPluginPaths(): string[] {
        const paths: string[] = []
        this._rootPluginPaths.forEach((rp) => {
            const subPaths = getDirectories(rp)
            paths.push(...subPaths)
        })

        return paths
    }

    private _getFirstPluginThatHasCapability(filetype: string, capability: string): null | Plugin {
        const handlers = this._plugins.filter((p) => p.doesPluginProvideLanguageServiceCapability(filetype, capability))

        if (handlers.length > 0) {
            return handlers[0]
        }

        const defaultHandlers = this._plugins.filter((p) => p.doesPluginProvideLanguageServiceCapability("*", capability))

        if (defaultHandlers.length > 0) {
            return defaultHandlers[0]
        }

        return null
    }

    private _handlePluginResponse(pluginResponse: any): void {
        if (pluginResponse.type === "show-quick-info") {
            if (!this._validateOriginEventMatchesCurrentEvent(pluginResponse)) {
                return
            }

            if (!pluginResponse.error) {
                setTimeout(() => UI.showQuickInfo(pluginResponse.payload.info, pluginResponse.payload.documentation))
            } else {
                setTimeout(() => UI.hideQuickInfo())
            }
        } else if (pluginResponse.type === "goto-definition") {
            if (!this._validateOriginEventMatchesCurrentEvent(pluginResponse)) {
                return
            }

            // TODO: Refactor to 'Service', break remaining NeoVim dependencies
            const { filePath, line, column } = pluginResponse.payload
            this._neovimInstance.command("e! " + filePath)
            this._neovimInstance.command("keepjumps norm " + line + "G" + column)
            this._neovimInstance.command("norm zz")
        } else if (pluginResponse.type === "completion-provider") {
            if (!this._validateOriginEventMatchesCurrentEvent(pluginResponse)) {
                return
            }

            setTimeout(() => UI.showCompletions(pluginResponse.payload))
        } else if (pluginResponse.type === "completion-provider-item-selected") {
            setTimeout(() => UI.setDetailedCompletionEntry(pluginResponse.payload.details))
        } else if (pluginResponse.type === "set-errors") {
            this.emit("set-errors", pluginResponse.payload.key, pluginResponse.payload.fileName, pluginResponse.payload.errors, pluginResponse.payload.colors)
        } else if (pluginResponse.type === "format") {
            this.emit("format", pluginResponse.payload)
        } else if (pluginResponse.type === "execute-shell-command") {
            // TODO: Check plugin permission
            this.emit("execute-shell-command", pluginResponse.payload)
        } else if (pluginResponse.type === "evaluate-block-result") {
            this.emit("evaluate-block-result", pluginResponse.payload)
        } else if (pluginResponse.type === "set-syntax-highlights") {
            this.emit("set-syntax-highlights", pluginResponse.payload)
        } else if (pluginResponse.type === "clear-syntax-highlights") {
            this.emit("clear-syntax-highlights", pluginResponse.payload)
        } else if (pluginResponse.type === "signature-help-response") {
            this.emit("signature-help-response", pluginResponse.error, pluginResponse.payload)
        }
    }

    private _onBufferUpdate(eventContext: Oni.EventContext, bufferLines: string[]): void {
        this._lastBufferInfo = {
            lines: bufferLines,
            fileName: eventContext.bufferFullPath,
            version: eventContext.version,
        }

        this._plugins
            .filter((p) => p.isPluginSubscribedToBufferUpdates(eventContext.filetype) || p.isPluginSubscribedToBufferUpdates("*"))
            .forEach((plugin) => plugin.notifyBufferUpdateEvent(eventContext, bufferLines))

    }

    private _onEvent(eventName: string, eventContext: Oni.EventContext): void {
        this._lastEventContext = eventContext

        this._plugins
            .filter((p) => p.isPluginSubscribedToVimEvents(eventContext.filetype) || p.isPluginSubscribedToVimEvents("*"))
            .forEach((plugin) => plugin.notifyVimEvent(eventName, eventContext))

        if (eventName === "CursorMoved" && Config.getValue<boolean>("editor.quickInfo.enabled")) {
            const plugin = this._getFirstPluginThatHasCapability(eventContext.filetype, QuickInfoCapability)

            if (plugin) {
                plugin.requestQuickInfo(eventContext)
            }
        } else if (eventName === "CursorMovedI" && Config.getValue<boolean>("editor.completions.enabled")) {
            const completionPlugin = this._getFirstPluginThatHasCapability(eventContext.filetype, CompletionProviderCapability)

            if (completionPlugin) {
                completionPlugin.requestCompletions(eventContext)
            }

            const plugin = this._getFirstPluginThatHasCapability(eventContext.filetype, SignatureHelpCapability)

            if (plugin) {
                plugin.requestSignatureHelp(eventContext)
            }
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
            console.log("Plugin response aborted as it didn't match current even (buffer/line/col)") // tslint:disable-line no-console
            return false
        }
    }
}

function getDirectories(rootPath: string | Buffer): string[] {
    return fs.readdirSync(rootPath)
        .map((f) => path.join(rootPath, f))
        .filter((f) => fs.statSync(f).isDirectory())
}
