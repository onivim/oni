import { EventEmitter } from "events"
import * as fs from "fs"
import * as path from "path"
import { INeovimInstance } from "./../neovim"
import { configuration } from "./../Services/Configuration"

import { AnonymousPlugin } from "./AnonymousPlugin"
import * as Capabilities from "./Api/Capabilities"
import * as Channel from "./Api/Channel"
import { Plugin } from "./Plugin"

const corePluginsRoot = path.join(__dirname, "vim", "core")
const defaultPluginsRoot = path.join(__dirname, "vim", "default")

export interface IEventContext {
    bufferFullPath: string
    line: number
    column: number
    byte: number
    filetype: string
}

export class PluginManager extends EventEmitter {
    private _config = configuration
    private _rootPluginPaths: string[] = []
    private _plugins: Plugin[] = []
    private _neovimInstance: INeovimInstance
    private _lastEventContext: any
    private _anonymousPlugin: AnonymousPlugin

    private _channel: Channel.IChannel = new Channel.InProcessChannel()

    constructor() {
        super()

        this._rootPluginPaths.push(corePluginsRoot)

        if (this._config.getValue("oni.useDefaultConfig")) {
            this._rootPluginPaths.push(defaultPluginsRoot)
            this._rootPluginPaths.push(path.join(defaultPluginsRoot, "bundle"))
        }

        this._rootPluginPaths.push(path.join(this._config.getUserFolder(), "plugins"))

        this._channel.host.onResponse((arg: any) => this._handlePluginResponse(arg))
    }

    public requestFormat(): void {
        this._sendLanguageServiceRequest("format", this._lastEventContext, "formatting")
    }

    public startPlugins(neovimInstance: INeovimInstance): Oni.Plugin.Api {
        this._neovimInstance = neovimInstance

        this._neovimInstance.on("event", (eventName: string, context: Oni.EventContext) => {
            this._onEvent(eventName, context)
        })

        const allPlugins = this._getAllPluginPaths()
        this._plugins = allPlugins.map((pluginRootDirectory) => this._createPlugin(pluginRootDirectory))

        this._anonymousPlugin = new AnonymousPlugin(this._channel)

        return this._anonymousPlugin.oni
    }

    public getAllRuntimePaths(): string[] {
        const pluginPaths = this._getAllPluginPaths()

        return pluginPaths.concat(this._rootPluginPaths)
    }

    public notifyBufferUpdate(eventContext: Oni.EventContext, bufferLines: string[]): void {
        this._channel.host.send({
            type: "buffer-update",
            payload: {
                eventContext,
                bufferLines,
            },
        }, Capabilities.createPluginFilter(eventContext.filetype))
    }

    public notifyBufferUpdateIncremental(eventContext: Oni.EventContext, lineNumber: number, bufferLine: string): void {
        this._channel.host.send({
            type: "buffer-update-incremental",
            payload: {
                eventContext,
                lineNumber,
                bufferLine,
            },
        }, Capabilities.createPluginFilter(eventContext.filetype))
    }

    private _createPlugin(pluginRootDirectory: string): Plugin {
        return new Plugin(pluginRootDirectory, this._channel)
    }

    private _getAllPluginPaths(): string[] {
        const paths: string[] = []
        this._rootPluginPaths.forEach((rp) => {
            const subPaths = getDirectories(rp)
            paths.push(...subPaths)
        })

        return paths
    }

    private _handlePluginResponse(pluginResponse: any): void {

        switch (pluginResponse.type) {
            case "format":
                this.emit("format", pluginResponse.payload)
                break
            default:
                this.emit("logWarning", "Unexpected plugin type: " + pluginResponse.type)
        }
    }

    private _onEvent(eventName: string, eventContext: Oni.EventContext): void {
        this._lastEventContext = eventContext

        this._channel.host.send({
            type: "event",
            payload: {
                name: eventName,
                context: eventContext,
            },
        }, Capabilities.createPluginFilter(this._lastEventContext.filetype))
    }

    private _sendLanguageServiceRequest(requestName: string, eventContext: any, languageServiceCapability?: any, additionalArgs?: any): void {
        languageServiceCapability = languageServiceCapability || requestName
        additionalArgs = additionalArgs || {}

        const payload = {
            name: requestName,
            context: eventContext,
            ...additionalArgs,
        }

        this._channel.host.send({
            type: "request",
            payload,
        }, Capabilities.createPluginFilter(eventContext.filetype))
    }

}

function getDirectories(rootPath: string): string[] {
    if (!fs.existsSync(rootPath)) {
        return []
    }

    return fs.readdirSync(rootPath)
        .map((f) => path.join(rootPath.toString(), f))
        .filter((f) => fs.statSync(f).isDirectory())
}
