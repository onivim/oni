/**
 * LightweightLanguageClient.ts
 *
 * Helper class for an in-proc strategy for implementing a language client interface
 */

// TODO: Move this to Oni core, so that it can be leveraged as part of the API surface
// (for lightweight completion scenarios, etc)

export type ServerRequestHandler = (requestName: string, payload: any) => Promise<any>
export type ClientRequestHandler = (payload: any) => Promise<any>
export type NotificationHandler = (notificationName: string, payload: any) => void

import { Event } from "oni-types"

export class LanguageConnection {
    constructor(private _client: LightweightLanguageClient) {}

    public request(requestName: string, language: string, payload: any): Promise<any> {
        return this._client._getClientRequestHandler(requestName)({
            language,
            payload,
        })
    }

    public notify(notificationName: string, language: string, payload: any) {
        this._client._notify(notificationName, language, payload)
    }

    public subscribeToNotification(
        notificationName: string,
        notificationHandler: NotificationHandler,
    ): void {
        this._client._handleNotification(notificationName, notificationHandler)
    }
    public subscribeToRequest(requestName: string, handler: ServerRequestHandler): void {
        this._client._handleRequest(requestName, handler)
    }
}

export class LightweightLanguageClient {
    private _subscriptions: { [key: string]: Event<any> } = {}

    // This is confusing because the requests are handled both ways...
    // This dictionary tracks handlers on the 'server' side
    private _requestHandler: { [key: string]: ServerRequestHandler } = {}

    private _clientRequestHandler: { [key: string]: ClientRequestHandler } = {}

    private _notificationHandler: { [key: string]: NotificationHandler } = {}

    public get connection(): LanguageConnection {
        return
    }

    public get serverCapabilities(): any {
        return {
            textDocumentSync: 2 /* incremental */,
            hoverProvider: true,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ["."],
            },
            signatureHelpProvider: {
                triggerCharacters: ["("],
            },
            definitionProvider: true,
            referencesProvider: true,
            formattingProvider: false,
            renameProvider: true,
            documentRangeFormattingProvider: true,

            // TODO:
            // codelensprovider
            // codeactionprovider
            // renameprovider
            // documentformattingprovider
        }
    }

    public subscribe(notificationName: string, evt: Event<any>) {
        this._subscriptions[notificationName] = evt
    }

    public async sendRequest<T>(
        fileName: string,
        requestName: string,
        protocolArguments: any,
    ): Promise<T> {
        const handler = this._requestHandler[requestName]

        const unwrappedValue = await this._unwrapThunk(protocolArguments)

        if (handler) {
            return handler(requestName, unwrappedValue)
        } else {
            return Promise.reject("Not implemented")
        }
    }

    public async sendNotification(
        fileName: string,
        notificationName: string,
        protocolArguments: any,
    ): Promise<void> {
        const notifier = this._notificationHandler[notificationName]

        const unwrappedValue = await this._unwrapThunk(protocolArguments)

        if (notifier) {
            notifier(notificationName, unwrappedValue)
        }
    }

    public handleRequest(requestName: string, handler: ClientRequestHandler): void {
        this._clientRequestHandler[requestName] = handler
    }

    public _handleRequest(requestName: string, handler: ServerRequestHandler): void {
        this._requestHandler[requestName] = handler
    }

    public _getClientRequestHandler(requestName): ClientRequestHandler {
        return this._clientRequestHandler[requestName]
    }

    public _handleNotification(
        notificationName: string,
        notificationHandler: NotificationHandler,
    ): void {
        this._notificationHandler[notificationName] = notificationHandler
    }

    public _notify(notificationName: string, language: string, payload: any): void {
        const notifierEvent = this._subscriptions[notificationName]

        if (notifierEvent) {
            ;(notifierEvent as any).dispatch({
                language, // TODO: Generalize for JS too
                payload,
            })
        }
    }

    private _unwrapThunk(valueOrThunk?: any): Promise<any> {
        if (typeof valueOrThunk !== "function") {
            return valueOrThunk
        } else {
            const val = valueOrThunk(this.serverCapabilities)

            if (!val) {
                return Promise.resolve(val)
            } else if (typeof val.then === "function") {
                return val
            } else {
                return Promise.resolve(val)
            }
        }
    }
}
