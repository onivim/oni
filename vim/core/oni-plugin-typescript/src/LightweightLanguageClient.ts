/**
 * LightweightLanguageClient.ts
 *
 * Helper class for an in-proc strategy for implementing a language client interface
 */

// TODO: Move this to Oni core, so that it can be leveraged as part of the API surface
// (for lightweight completion scenarios, etc)

export type RequestHandler = (requestName: string, payload: any) => Promise<any>
export type NotificationHandler = (notificationName: string, payload: any) => void

export class LightweightLanguageClient {

    private _subscriptions: { [key: string]: Oni.Event<any> } = { }

    private _requestHandler: { [key: string]: RequestHandler } = { }
    private _notificationHandler: { [key: string]: NotificationHandler } = { }

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

            // TODO:
            // codelensprovider
            // codeactionprovider
            // renameprovider
            // documentformattingprovider
        }
    }

    public subscribe(notificationName: string, evt: Oni.Event<any>) {
        this._subscriptions[notificationName] = evt
    }

    public async sendRequest<T>(fileName: string, requestName: string, protocolArguments: any): Promise<T> {

        const handler = this._requestHandler[requestName]

        const unwrappedValue = await this._unwrapThunk(protocolArguments)

        if (handler) {
            return handler(requestName, unwrappedValue)
        } else {
            return Promise.reject("Not implemented")
        }
    }

    public async sendNotification(fileName: string, notificationName: string, protocolArguments: any): Promise<void> {

        const notifier = this._notificationHandler[notificationName]

        const unwrappedValue = await this._unwrapThunk(protocolArguments)

        if (notifier) {
            notifier(notificationName, unwrappedValue)
        }
    }

    public handleRequest(requestName: string, handler: RequestHandler): void {
        this._requestHandler[requestName] = handler
    }

    public handleNotification(notificationName: string, notificationHandler: NotificationHandler): void {
        this._notificationHandler[notificationName] = notificationHandler
    }

    public notify(notificationName: string, language: string, payload: any): void {
        const notifierEvent = this._subscriptions[notificationName]

        if (notifierEvent) {
            (<any>notifierEvent).dispatch({
                language, // TODO: Generalize for JS too
                payload,
            })
        }
    }

    private _unwrapThunk(valueOrThunk?: any): Promise<any> {
        if(typeof(valueOrThunk) !== "function") {
            return valueOrThunk
        } else {
            const val = valueOrThunk(this.serverCapabilities)

            if (typeof(val.then) === "function") {
                return val
            } else {
                return Promise.resolve(val)
            }
        }
    }
}
