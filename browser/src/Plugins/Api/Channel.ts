import { EventEmitter } from "events"

/**
 * Interface that describes a strategy for sending data
 * to the main process from the plugin
 */
export interface IPluginChannel {
    send(type: string, originalEventContext: any, payload: any): void
    sendError(type: string, originalEventContext: any, error: string): void

    onRequest(requestCallback: (arg: any) => void): void
}

export interface IHostChannel {
    send(message: any): void

    onResponse(responseCallback: (arg: any) => void): void
}

export interface IChannel {
    host: IHostChannel
    plugin: IPluginChannel
}

export class InProcessChannel implements IChannel {

    public get host(): IHostChannel {
        return this._hostChannel
    }

    public get plugin(): IPluginChannel {
        return this._pluginChannel
    }

    constructor(
        private _hostChannel: InProcessHostChannel = new InProcessHostChannel(),
        private _pluginChannel: InProcessPluginChannel = new InProcessPluginChannel()
    ) {

        this._hostChannel.on("send-request", (arg: any) => {
            setTimeout(() => this._pluginChannel.emit("host-request", arg), 0)
        })

        this._pluginChannel.on("send", (arg: any) => {
            setTimeout(() => this._hostChannel.emit("plugin-response", arg), 0)
        })

        this._pluginChannel.on("send-error", (arg: any) => {
            setTimeout(() => this._hostChannel.emit("plugin-response", arg), 0)
        })
    }
}

export class InProcessHostChannel extends EventEmitter implements IHostChannel {
    public send(arg: any): void {
        this.emit("send-request", arg)
    }

    public onResponse(responseCallback: (arg: any) => void): void {
        this.on("plugin-response", responseCallback);
    }
}

export class InProcessPluginChannel extends EventEmitter implements IPluginChannel {
    public onRequest(requestCallback: (arg: any) => void): void {
        this.on("host-request", requestCallback);
    }

    public send(type: string, originalEventContext: any, payload: any): void {
        this.emit("send", {
            type: type,
            meta: {
                originEvent: originalEventContext
            },
            payload: payload
        })
    }

    public sendError(type: string, originalEventContext: any, error: string): void {
        this.emit("send-error", {
            type: type,
            meta: {
                originEvent: originalEventContext
            },
            error: error
        })
    }
}
