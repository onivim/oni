/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
 */

import { Event } from "./../../Event"
import { IDisposable } from "./../../IDisposable"
import * as Log from "./../../Log"

import { editorManager } from "./../EditorManager"

import { ILanguageClient } from "./LanguageClient"
import { IServerCapabilities } from "./ServerCapabilities"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

export interface ILanguageServerNotificationResponse {
    language: string
    payload: any
}

export class LanguageManager {

    private _languageServerInfo: { [language: string]: ILanguageClient } = {}

    private _notificationSubscriptions: { [notificationMessage: string]: Event<any> }  = {}

    constructor() {
        editorManager.allEditors.onBufferEnter.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath } = bufferInfo

            return this.sendLanguageServerNotification(language, filePath, "textDocument/didOpen", Helpers.pathToTextDocumentIdentifierParms(filePath))
        })

        editorManager.allEditors.onBufferLeave.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath } = bufferInfo
            return this.sendLanguageServerNotification(language, filePath, "textDocument/didClose", Helpers.pathToTextDocumentIdentifierParms(filePath))
        })

        editorManager.allEditors.onBufferChanged.subscribe(async (change: Oni.EditorBufferChangedEventArgs) => {

            const { language, filePath } = change.buffer
            // const capabilities = await this.getCapabilitiesForLanguage(language)

            // const syncMode = (capabilities & typeof capabilities.textDocumentSync === "number")

            // TODO: Incremental buffer updates...
            return this.sendLanguageServerNotification(language, filePath, "textDocument/didChange", {
                textDocument: {
                    uri: Helpers.wrapPathInFileUri(filePath),
                    version: change.buffer.version,
                },
                contentChanges: change.contentChanges,
            })
        })

        editorManager.allEditors.onBufferSaved.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath} = bufferInfo
            return this.sendLanguageServerNotification(language, filePath, "textDocument/didSave", Helpers.pathToTextDocumentIdentifierParms(filePath))
        })

        this.subscribeToLanguageServerNotification("window/logMessage", (args) => {
            // logInfo("window/logMessage: " + JSON.stringify(args))
        })

        this.subscribeToLanguageServerNotification("telemetry/event", (args) => {
            // logInfo("telemetry/event:" + JSON.stringify(args))
        })
    }

    public getCapabilitiesForLanguage(language: string): Promise<IServerCapabilities> {
        const languageClient = this._getLanguageClient(language)

        if (languageClient) {
            return Promise.resolve(languageClient.serverCapabilities)
        } else {
            return Promise.resolve(null)
        }
    }

    public getTokenRegex(language: string): RegExp {
        return /[$_a-zA-Z0-9]/i
    }

    public getSignatureHelpTriggerCharacters(language: string): string[] {
        return ["("]
    }

    public isLanguageServerAvailable(language: string): boolean {
        return !!this._getLanguageClient(language)
    }

    public sendLanguageServerNotification(language: string, filePath: string, protocolMessage: string, protocolPayload: any): void {
        const languageClient = this._getLanguageClient(language)

        if (languageClient) {
            languageClient.sendNotification(filePath, protocolMessage, protocolPayload)
        } else {
            Log.error("No supported language")
        }
    }

    public sendLanguageServerRequest(language: string, filePath: string, protocolMessage: string, protocolPayload: any): Promise<any> {
        const languageClient = this._getLanguageClient(language)

        if (languageClient) {
            return languageClient.sendRequest(filePath, protocolMessage, protocolPayload)
        } else {
            return Promise.reject("No language server registered")
        }
    }

    public subscribeToLanguageServerNotification(protocolMessage: string, callback: (args: ILanguageServerNotificationResponse) => void): IDisposable {

        const currentSubscription = this._notificationSubscriptions[protocolMessage]

        if (!currentSubscription) {
            const evt = new Event<any>()
            this._notificationSubscriptions[protocolMessage] = evt

            const languageClients = Object.values(this._languageServerInfo)
            languageClients.forEach((ls) => {
                ls.subscribe(protocolMessage, evt)
            })

            return evt.subscribe((args) => callback(args))
        } else {
            return currentSubscription.subscribe((args) => callback(args))
        }
    }

    public unwrapFileUriPath(fileUri: string): string {
        return Helpers.unwrapFileUriPath(fileUri)
    }

    public wrapPathInFileUri(filePath: string): string {
        return Helpers.wrapPathInFileUri(filePath)
    }

    public registerLanguageClient(language: string, languageClient: ILanguageClient): any {
        if (this._languageServerInfo[language]) {
            Log.error("Duplicate language server registered for: " + language)
            return
        }

        Object.keys(this._notificationSubscriptions).forEach((notification) => {
            languageClient.subscribe(notification, this._notificationSubscriptions[notification])
        })

        this._languageServerInfo[language]  = languageClient
    }

    private _getLanguageClient(language: string): ILanguageClient {
        return this._languageServerInfo[language]
    }
}

// const logInfo = (msg: string) => {
//     Log.info("[Language Manager] " + msg)
// }

export const languageManager = new LanguageManager()
