import * as rpc from "vscode-jsonrpc"

import { Event } from "oni-types"

import * as Log from "./../../Log"

import { ILanguageClientProcess } from "./LanguageClientProcess"
import { PromiseQueue } from "./PromiseQueue"
import { IServerCapabilities } from "./ServerCapabilities"

import * as LanguageClientTypes from "./LanguageClientTypes"

export interface ILanguageClient {
    serverCapabilities: IServerCapabilities
    subscribe(notificationName: string, evt: Event<any>): void
    handleRequest(requestName: string, handler: LanguageClientTypes.RequestHandler): void

    sendRequest<T>(
        fileName: string,
        requestName: string,
        protocolArguments: LanguageClientTypes.NotificationValueOrThunk,
    ): Promise<T>
    sendNotification(
        fileName: string,
        notificationName: string,
        protocolArguments: LanguageClientTypes.NotificationValueOrThunk,
    ): void
}

export class LanguageClient implements ILanguageClient {
    private _promiseQueue = new PromiseQueue()

    private _connection: rpc.MessageConnection
    private _subscriptions: { [key: string]: Event<any> } = {}
    private _requestHandlers: { [key: string]: LanguageClientTypes.RequestHandler } = {}

    public get serverCapabilities(): IServerCapabilities {
        return this._languageClientProcess.serverCapabilities
    }

    constructor(private _language: string, private _languageClientProcess: ILanguageClientProcess) {
        this._languageClientProcess.onConnectionChanged.subscribe(
            (newConnection: rpc.MessageConnection) => {
                this._connection = newConnection

                Object.keys(this._subscriptions).forEach(notification => {
                    const evt = this._subscriptions[notification]
                    this._connection.onNotification(notification, (args: any) => {
                        evt.dispatch({
                            language: this._language,
                            payload: args,
                        })
                    })
                })

                Object.keys(this._requestHandlers).forEach(request => {
                    const handler = this._requestHandlers[request]
                    if (handler) {
                        this._connection.onRequest(request, handler)
                    }
                })
            },
        )
    }

    public subscribe(notificationName: string, evt: Event<any>) {
        if (this._connection) {
            this._connection.onNotification(notificationName, (args: any) => {
                evt.dispatch({
                    language: this._language,
                    payload: args,
                })
            })
        }

        this._subscriptions[notificationName] = evt
    }

    public handleRequest(requestName: string, handler: (payload: any) => Promise<any>): void {
        if (this._requestHandlers[requestName]) {
            Log.error("Only one handler is allowed")
        }

        if (this._connection) {
            this._connection.onRequest(requestName, handler)
        }

        this._requestHandlers[requestName] = handler
    }

    public sendRequest<T>(
        fileName: string,
        requestName: string,
        protocolArguments: LanguageClientTypes.NotificationValueOrThunk,
    ): Promise<T> {
        return this._promiseQueue.enqueuePromise<T>(async () => {
            this._connection = await this._languageClientProcess.ensureActive(fileName)

            const args = await LanguageClientTypes.unwrapThunkOrValue(
                protocolArguments,
                this.serverCapabilities,
            )

            logInfo(`Request ${requestName} - ${fileName}: start`)
            const result = await this._connection.sendRequest<T>(requestName, args)
            logInfo(`Request ${requestName} - ${fileName}: end`)
            return result
        })
    }

    public sendNotification(
        fileName: string,
        notificationName: string,
        protocolArguments: LanguageClientTypes.NotificationValueOrThunk,
    ): void {
        this._promiseQueue.enqueuePromise(async () => {
            this._connection = await this._languageClientProcess.ensureActive(fileName)

            const args = await LanguageClientTypes.unwrapThunkOrValue(
                protocolArguments,
                this.serverCapabilities,
            )

            logInfo(`Notification ${notificationName} - ${fileName}: start`)

            await this._connection.sendNotification(notificationName, args)

            logInfo(`Notification ${notificationName} - ${fileName}: end`)
        })
    }
}

const logInfo = (msg: string): void => {
    Log.info("[Language Client] " + msg)
}
