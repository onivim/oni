/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
 */

import * as os from "os"

import { Event } from "./../../Event"
import { IDisposable } from "./../../IDisposable"
import * as Log from "./../../Log"

import { configuration } from "./../Configuration"
import { editorManager } from "./../EditorManager"

import { ILanguageClient } from "./LanguageClient"
import { IServerCapabilities } from "./ServerCapabilities"

import * as LanguageClientTypes from "./LanguageClientTypes"

import { LanguageClientState, LanguageClientStatusBar } from "./LanguageClientStatusBar"

import { listenForWorkspaceEdits } from "./Workspace"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

export interface ILanguageServerNotificationResponse {
    language: string
    payload: any
}

export class LanguageManager {

    private _languageServerInfo: { [language: string]: ILanguageClient } = {}
    private _notificationSubscriptions: { [notificationMessage: string]: Event<any> }  = {}
    private _requestHandlers: { [request: string]: LanguageClientTypes.RequestHandler } = {}
    private _statusBar = new LanguageClientStatusBar()

    constructor() {
        editorManager.allEditors.onBufferEnter.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath } = bufferInfo

            if (language) {
                this._statusBar.show(language)
                this._statusBar.setStatus(LanguageClientState.Initializing)
            } else {
                this._statusBar.hide()
            }

            return this.sendLanguageServerNotification(language, filePath, "textDocument/didOpen", () => {
                this._statusBar.setStatus(LanguageClientState.Active)
                return Helpers.pathToTextDocumentIdentifierParms(filePath)
            })
        })

        editorManager.allEditors.onBufferLeave.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath } = bufferInfo
            return this.sendLanguageServerNotification(language, filePath, "textDocument/didClose", Helpers.pathToTextDocumentIdentifierParms(filePath))
        })

        editorManager.allEditors.onBufferChanged.subscribe(async (change: Oni.EditorBufferChangedEventArgs) => {

            const { language, filePath } = change.buffer

            const sendBufferThunk = async (capabilities: IServerCapabilities) => {
                const textDocument = {
                    uri: Helpers.wrapPathInFileUri(filePath),
                    version: change.buffer.version,
                }

                // If the service supports incremental capabilities, just pass it directly
                if (capabilities.textDocumentSync === 2) {
                    return {
                        textDocument,
                        contentChanges: change.contentChanges,
                    }
                // Otherwise, get the whole buffer and send it up
                } else {
                    const allBufferLines = await change.buffer.getLines()

                    return {
                        textDocument,
                        contentChanges: [{ text: allBufferLines.join(os.EOL) }],
                    }
                }
            }

            return this.sendLanguageServerNotification(language, filePath, "textDocument/didChange", sendBufferThunk)
        })

        editorManager.allEditors.onBufferSaved.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath} = bufferInfo
            return this.sendLanguageServerNotification(language, filePath, "textDocument/didSave", Helpers.pathToTextDocumentIdentifierParms(filePath))
        })

        this.subscribeToLanguageServerNotification("window/showMessage", (args) => {
            Log.warn("window/showMessage not implemented: " + JSON.stringify(args.toString()))
        })

        this.subscribeToLanguageServerNotification("window/logMessage", (args) => {
            logVerbose(args)
        })

        this.subscribeToLanguageServerNotification("telemetry/event", (args) => {
            logDebug(args)
        })

        this.handleLanguageServerRequest("window/showMessageRequest", async (req) => {
            logVerbose(req)
            return null
        })

        listenForWorkspaceEdits(this)
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

    public getCompletionTriggerCharacters(language: string): string[] {
        const languageSpecificTriggerChars = configuration.getValue(`language.${language}.completionTriggerCharacters`)

        if (languageSpecificTriggerChars) {
            return languageSpecificTriggerChars
        } else {
            return ["."]
        }
    }

    public isLanguageServerAvailable(language: string): boolean {
        return !!this._getLanguageClient(language)
    }

    public async sendLanguageServerNotification(language: string, filePath: string, protocolMessage: string, protocolPayload: LanguageClientTypes.NotificationValueOrThunk): Promise<void> {
        const languageClient = this._getLanguageClient(language)

        if (languageClient) {
            await languageClient.sendNotification(filePath, protocolMessage, protocolPayload)
        } else {
            Log.verbose("No supported language")
        }
    }

    public async sendLanguageServerRequest(language: string, filePath: string, protocolMessage: string, protocolPayload: LanguageClientTypes.NotificationValueOrThunk): Promise<any> {
        const languageClient = this._getLanguageClient(language)

        Log.verbose("[LANGUAGE] Sending request: " + protocolMessage + "|" + JSON.stringify(protocolPayload))

        if (languageClient) {
            try {
            const result = await languageClient.sendRequest(filePath, protocolMessage, protocolPayload)
            this._setStatus(protocolMessage, LanguageClientState.Active)
            return result
            } catch (ex) {
                this._setStatus(protocolMessage, LanguageClientState.Error)
                throw ex
            }
        } else {
            this._setStatus(protocolMessage, LanguageClientState.Error)
            return Promise.reject("No language server registered")
        }
    }

    // Register a handler for requests incoming from the language server
    public handleLanguageServerRequest(protocolMessage: string, callback: (args: ILanguageServerNotificationResponse) => Promise<any>): void {

        const currentHandler = this._requestHandlers[protocolMessage]

        if (currentHandler) {
            return
        }

        this._requestHandlers[protocolMessage] = callback

        const languageClients = Object.values(this._languageServerInfo)
        languageClients.forEach((ls) => {
            ls.handleRequest(protocolMessage, callback)
        })
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

        Object.keys(this._requestHandlers).forEach((request) => {
            languageClient.handleRequest(request, this._requestHandlers[request])
        })

        this._languageServerInfo[language]  = languageClient
    }

    private _getLanguageClient(language: string): ILanguageClient {
        return this._languageServerInfo[language]
    }

    private _setStatus(protocolMessage: string, status: LanguageClientState): void {

        switch (protocolMessage) {
            case "textDocument/didOpen":
            case "textDocument/didChange":
                this._statusBar.setStatus(status)
                break
            default:
                break
        }
    }
}

const logVerbose = (args: any) => {
    if (Log.isVerboseLoggingEnabled()) {
        Log.verbose("[Language Manager] " + JSON.stringify(args))
    }
}

const logDebug = (args: any) => {
    if (Log.isDebugLoggingEnabled()) {
        Log.debug("[Language Manager] " + JSON.stringify(args))
    }
}

export const languageManager = new LanguageManager()
