/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
*/

import * as Log from "./../../Log"
import { Event } from "./../../Event"
import { IDisposable } from "./../../IDisposable"

import { editorManager } from "./../EditorManager"

import { LanguageClient2 } from "./LanguageClient2"
import { ILanguageClientProcess } from "./LanguageClientProcess"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

export interface ILanguageServerNotificationResponse {
    language: string
    payload: any
}

export class LanguageManager {

    private _languageServerInfo: { [language: string]: LanguageClient2 } = {}

    private _notificationSubscriptions: { [notificationMessage: string]: Event<any> }  = {}

    constructor() {
        editorManager.allEditors.onBufferEnter.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath } = bufferInfo

            console.log("Buffer enter: " + bufferInfo.filePath)
            return this.sendLanguageServerRequest(language, filePath, "textDocument/didOpen", Helpers.pathToTextDocumentIdentifierParms(filePath)
        })

        editorManager.allEditors.onBufferLeave.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath } = bufferInfo
            console.log("Buffer leave: " + bufferInfo.filePath)
            return this.sendLanguageServerRequest(language, filePath, "textDocument/didClose", Helpers.pathToTextDocumentIdentifierParms(filePath))
        })
    }

    public sendLanguageServerRequest(language: string, filePath: string, protocolMessage: string, protocolPayload: any): Promise<void> {
        const languageClient = this._getLanguageClient(language)

        if (languageClient) {
            return languageClient.sendRequest(filePath, protocolMessage, protocolPayload)
        } else {
            return new Promise((res, rej) => rej("No registered language client"))
        }
    }

    public subscribeToLanguageServerNotification(protocolMessage: string, callback: (args: ILanguageServerNotificationResponse) => void): IDisposable {

        const currentSubscription = this._notificationSubscriptions[protocolMessage]

        if (!currentSubscription) {
            const evt = new Event<any>()
            this._notificationSubscriptions[protocolMessage] = evt

            const languageClients = Object.values(this._languageServerInfo)
            languageClients.forEach((ls) => {
                ls.subscribe
            })

            return evt.subscribe((args) => callback(args))
        } else {
            return currentSubscription.subscribe((args) => callback(args))
        }
    }

    public registerLanguageClientFromProcess(language: string, languageProcess: ILanguageClientProcess): any {

        if (this._languageServerInfo[language]) {
            Log.error("Duplicate language server registered for: " + language)
            return
        }

        this._languageServerInfo[language] = new LanguageClient2(language, languageProcess)
    }

    private _getLanguageClient(language: string): LanguageClient2 {
        return this._languageServerInfo[language]
    }
}

export const languageManager = new LanguageManager()
