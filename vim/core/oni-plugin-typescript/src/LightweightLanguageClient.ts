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

    public subscribe(notificationName: string, evt: Oni.Event<any>) {
        this._subscriptions[notificationName] = evt
    }

    public sendRequest<T>(fileName: string, requestName: string, protocolArguments: any): Promise<T> {

        const handler = this._requestHandler[requestName]

        if (handler) {
            return handler(requestName, protocolArguments)
        } else {
            return Promise.reject("Not implemented")
        }
    }

    public sendNotification(fileName: string, notificationName: string, protocolArguments: any): void {

        const notifier = this._notificationHandler[notificationName]

        if (notifier) {
            notifier(notificationName, protocolArguments)
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
}
