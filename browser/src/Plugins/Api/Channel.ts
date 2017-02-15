/**
 * Channel.ts
 *
 * Channel describes the communication channel between the host code (Oni) and the plugin code.
 *
 * The channel interfaces are meant to be transport-agnostic - meaning that we could implement them
 * as in-process, over websockets, over IPC, etc - this gives us lots of flexibility in terms of how
 * plugins are managed.
 */

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
    createPluginChannel(): IPluginChannel
}

export class InProcessChannel implements IChannel {

    private _pluginChannels: InProcessPluginChannel[] = []

    public get host(): IHostChannel {
        return this._hostChannel
    }

    constructor(
        private _hostChannel: InProcessHostChannel = new InProcessHostChannel(),
    ) {

        this._hostChannel.on("send-request", (arg: any) => {
            setTimeout(() => {
                const pluginsToBroadcast = this._getChannelsForRequestFromHost()
                pluginsToBroadcast.forEach((channel) => channel.emit("host-request", arg))
            }, 0)
        })
    }

    public createPluginChannel(): IPluginChannel {
        const channel = new InProcessPluginChannel()
        this._pluginChannels.push(channel)

        channel.on("send", (arg: any) => {
            setTimeout(() => this._hostChannel.emit("plugin-response", arg), 0)
        })

        channel.on("send-error", (arg: any) => {
            setTimeout(() => this._hostChannel.emit("plugin-response", arg), 0)
        })

        return channel
    }

    private _getChannelsForRequestFromHost(): InProcessPluginChannel[] {
        // TODO: Implement filtering layer
        return this._pluginChannels
    }
}

export class InProcessPluginChannelFactory {

}

export class InProcessHostChannel extends EventEmitter implements IHostChannel {
    public send(arg: any): void {
        this.emit("send-request", arg)
    }

    public onResponse(responseCallback: (arg: any) => void): void {
        this.on("plugin-response", responseCallback)
    }
}

export class InProcessPluginChannel extends EventEmitter implements IPluginChannel {
    public onRequest(requestCallback: (arg: any) => void): void {
        this.on("host-request", requestCallback)
    }

    public send(type: string, originalEventContext: any, payload: any): void {
        this.emit("send", {
            type,
            meta: {
                originEvent: originalEventContext,
            },
            payload,
        })
    }

    public sendError(type: string, originalEventContext: any, error: string): void {
        this.emit("send-error", {
            type,
            meta: {
                originEvent: originalEventContext,
            },
            error,
        })
    }
}
