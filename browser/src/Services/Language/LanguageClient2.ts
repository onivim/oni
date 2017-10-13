import * as rpc from "vscode-jsonrpc"

import { Event } from "./../../Event"
import * as Log from "./../../Log"

import { ILanguageClientProcess } from "./LanguageClientProcess"
import { PromiseQueue } from "./PromiseQueue"

// TODO: Naming it 'LanguageClient2' so as not to conflict with the other,
// legacy LanguageClient. Once the work is complete, `LanguageClient` will go away
// and `LanguageClient2` will be renamed.
//
// In other words, this will handle a superset of the cases `LanguageClient` handled
export class LanguageClient2 {
    private _promiseQueue = new PromiseQueue()

    private _connection: rpc.MessageConnection
    private _subscriptions: { [key: string]: Event<any> } = {}

    constructor(
        private _language: string,
        private _languageClientProcess: ILanguageClientProcess) {

        this._languageClientProcess.onConnectionChanged.subscribe((newConnection: rpc.MessageConnection) => {
            this._connection = newConnection

            Object.keys(this._subscriptions).forEach((notification) => {
                const evt = this._subscriptions[notification]
                this._connection.onNotification(notification, (args: any) => {
                    evt.dispatch({
                        language: this._language,
                        payload: args,
                    })
                })
            })
        })
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

    public sendRequest<T>(fileName: string, requestName: string, protocolArguments: any): Promise<T> {
        return this._promiseQueue.enqueuePromise<T>(async () => {

            this._connection = await this._languageClientProcess.ensureActive(fileName)

            logInfo(`Request ${requestName} - ${fileName}: start`)
            const result = await this._connection.sendRequest<T>(requestName, protocolArguments)
            logInfo(`Request ${requestName} - ${fileName}: end`)
            return result
        })
    }

    public sendNotification(fileName: string, notificationName: string, protocolArguments: any): void {
        this._promiseQueue.enqueuePromise(async () => {
            this._connection = await this._languageClientProcess.ensureActive(fileName)

            logInfo(`Notification ${notificationName} - ${fileName}: start`)

            await this._connection.sendNotification(notificationName, protocolArguments)

            logInfo(`Notification ${notificationName} - ${fileName}: end`)
        })
    }
}

const logInfo = (msg: string): void => {
    Log.info("[Language Client] " + msg)
}
