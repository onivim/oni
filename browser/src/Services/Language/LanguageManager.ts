/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
 */

import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"
import { Event, IDisposable } from "oni-types"

import * as Log from "./../../Log"

import { ILanguageClient } from "./LanguageClient"
import * as LanguageClientTypes from "./LanguageClientTypes"
import { IServerCapabilities } from "./ServerCapabilities"

import { LanguageClientState, LanguageClientStatusBar } from "./LanguageClientStatusBar"
import { PluginManager } from "./../../Plugins/PluginManager"
import * as Capabilities from "./../../Plugins/Api/Capabilities"

import { listenForWorkspaceEdits } from "./Workspace"

import { IWorkspace } from "./../Workspace"

import * as Utility from "./../../Utility"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

export interface ILanguageServerNotificationResponse {
    language: string
    payload: any
}

export class LanguageManager {
    private _languageServerInfo: { [language: string]: ILanguageClient } = {}
    private _notificationSubscriptions: { [notificationMessage: string]: Event<any> } = {}
    private _requestHandlers: { [request: string]: LanguageClientTypes.RequestHandler } = {}
    private _languageClientStatusBar: LanguageClientStatusBar
    private _currentTrackedFile: string = null

    constructor(
        private _configuration: Oni.Configuration,
        private _editorManager: Oni.EditorManager,
        private _pluginManager: PluginManager,
        private _statusBar: Oni.StatusBar,
        private _workspace: IWorkspace,
    ) {
        this._languageClientStatusBar = new LanguageClientStatusBar(this._statusBar)

        this._editorManager.anyEditor.onBufferEnter.subscribe(async () => this._onBufferEnter())

        this._editorManager.anyEditor.onBufferLeave.subscribe(
            (bufferInfo: Oni.EditorBufferEventArgs) => {
                const { language, filePath } = bufferInfo

                if (this._currentTrackedFile !== filePath) {
                    return
                }

                this.sendLanguageServerNotification(
                    language,
                    filePath,
                    "textDocument/didClose",
                    Helpers.pathToTextDocumentIdentifierParms(filePath),
                )
            },
        )

        this._editorManager.anyEditor.onBufferChanged.subscribe(
            async (change: Oni.EditorBufferChangedEventArgs) => {
                const { language, filePath } = change.buffer

                if (this._currentTrackedFile !== filePath) {
                    return
                }

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

                this.sendLanguageServerNotification(
                    language,
                    filePath,
                    "textDocument/didChange",
                    sendBufferThunk,
                )
            },
        )

        this._editorManager.anyEditor.onBufferSaved.subscribe(
            (bufferInfo: Oni.EditorBufferEventArgs) => {
                const { language, filePath } = bufferInfo

                if (this._currentTrackedFile !== filePath) {
                    return
                }

                this.sendLanguageServerNotification(
                    language,
                    filePath,
                    "textDocument/didSave",
                    Helpers.pathToTextDocumentIdentifierParms(filePath),
                )
            },
        )

        this.subscribeToLanguageServerNotification("window/showMessage", args => {
            Log.warn("window/showMessage not implemented: " + JSON.stringify(args.toString()))
        })

        this.subscribeToLanguageServerNotification("window/logMessage", args => {
            logVerbose(args)
        })

        this.subscribeToLanguageServerNotification("telemetry/event", args => {
            logDebug(args)
        })

        this.handleLanguageServerRequest("workspace/configuration", async req => {
            Log.warn("workspace/configuration not implemented: " + JSON.stringify(req.toString()))
            return null
        })

        this.handleLanguageServerRequest("window/showMessageRequest", async req => {
            logVerbose(req)
            return null
        })

        listenForWorkspaceEdits(this, this._workspace)
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
        const languageSpecificTokenRegex = this._configuration.getValue(
            `language.${language}.tokenRegex`,
        ) as RegExp

        if (languageSpecificTokenRegex) {
            return RegExp(languageSpecificTokenRegex, "i")
        } else {
            return /[$_a-zA-Z0-9]/i
        }
    }

    public getSignatureHelpTriggerCharacters(language: string): string[] {
        return ["("]
    }

    public getCompletionTriggerCharacters(language: string): string[] {
        const languageSpecificTriggerChars = this._configuration.getValue(
            `language.${language}.completionTriggerCharacters`,
        ) as string[]

        if (languageSpecificTriggerChars) {
            return languageSpecificTriggerChars
        } else {
            return ["."]
        }
    }

    public isLanguageServerAvailable(language: string): boolean {
        return !!this._getLanguageClient(language)
    }

    public async sendLanguageServerNotification(
        language: string,
        filePath: string,
        protocolMessage: string,
        protocolPayload: LanguageClientTypes.NotificationValueOrThunk,
    ): Promise<void> {
        const languageClient = this._getLanguageClient(language)

        await this._simulateFakeLag()

        if (languageClient) {
            await languageClient.sendNotification(filePath, protocolMessage, protocolPayload)
        } else {
            Log.verbose("No supported language")
        }
    }

    public async sendLanguageServerRequest(
        language: string,
        filePath: string,
        protocolMessage: string,
        protocolPayload: LanguageClientTypes.NotificationValueOrThunk,
    ): Promise<any> {
        const languageClient = this._getLanguageClient(language)

        Log.verbose(
            "[LANGUAGE] Sending request: " +
                protocolMessage +
                "|" +
                JSON.stringify(protocolPayload),
        )

        await this._simulateFakeLag()

        if (languageClient) {
            try {
                const result = await languageClient.sendRequest(
                    filePath,
                    protocolMessage,
                    protocolPayload,
                )
                this._setStatus(protocolMessage, LanguageClientState.Active)
                return result
            } catch (ex) {
                this._setStatus(protocolMessage, LanguageClientState.Error)
                throw ex
            }
        } else {
            this._setStatus(protocolMessage, LanguageClientState.NotAvailable)
            return Promise.reject("No language server registered")
        }
    }

    // Register a handler for requests incoming from the language server
    public handleLanguageServerRequest(
        protocolMessage: string,
        callback: (args: ILanguageServerNotificationResponse) => Promise<any>,
    ): void {
        const currentHandler = this._requestHandlers[protocolMessage]

        if (currentHandler) {
            return
        }

        this._requestHandlers[protocolMessage] = callback

        const languageClients = Object.values(this._languageServerInfo)
        languageClients.forEach(ls => {
            ls.handleRequest(protocolMessage, callback)
        })
    }

    public subscribeToLanguageServerNotification(
        protocolMessage: string,
        callback: (args: ILanguageServerNotificationResponse) => void,
    ): IDisposable {
        const currentSubscription = this._notificationSubscriptions[protocolMessage]

        if (!currentSubscription) {
            const evt = new Event<any>()
            this._notificationSubscriptions[protocolMessage] = evt

            const languageClients = Object.values(this._languageServerInfo)
            languageClients.forEach(ls => {
                ls.subscribe(protocolMessage, evt)
            })

            return evt.subscribe(args => callback(args))
        } else {
            return currentSubscription.subscribe(args => callback(args))
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

        Object.keys(this._notificationSubscriptions).forEach(notification => {
            languageClient.subscribe(notification, this._notificationSubscriptions[notification])
        })

        Object.keys(this._requestHandlers).forEach(request => {
            languageClient.handleRequest(request, this._requestHandlers[request])
        })

        this._languageServerInfo[language] = languageClient

        // If there is already a buffer open matching this language,
        // we should send a buffer open event
        if (
            this._editorManager.activeEditor.activeBuffer &&
            this._editorManager.activeEditor.activeBuffer.language === language
        ) {
            this._onBufferEnter()
        }
    }

    private async _onBufferEnter(): Promise<void> {
        if (!this._editorManager.activeEditor.activeBuffer) {
            Log.warn("[LanguageManager] No active buffer on buffer enter")
            return
        }

        const buffer = this._editorManager.activeEditor.activeBuffer
        const { language, filePath } = buffer

        if (!language) {
            const languages = this._pluginManager.getAllContributionsOfType<
                Capabilities.ILanguageContribution
            >(contributes => contributes.languages)
            const matchingLanguages = languages.filter(l =>
                l.extensions.indexOf(path.extname(filePath)),
            )
            if (matchingLanguages.length > 0) {
                Log.info(
                    `[LanguageManager::_onBufferEnter] Setting language for file ${filePath} to ${
                        matchingLanguages[0].id
                    }`,
                )
                await (buffer as any).setLanguage(matchingLanguages[0].id)
            }
        }

        if (language) {
            this._languageClientStatusBar.show(language)

            if (this._hasLanguageClient(language)) {
                this._languageClientStatusBar.setStatus(LanguageClientState.Initializing)
            } else {
                this._languageClientStatusBar.setStatus(LanguageClientState.NotAvailable)
            }
        }

        if (buffer.lineCount > this._configuration.getValue("editor.maxLinesForLanguageServices")) {
            this._languageClientStatusBar.setStatus(LanguageClientState.NotAvailable)
            Log.info(
                "[LanguageManager] Not sending 'didOpen' because file line count exceeds limit.",
            )
            return
        }

        await this.sendLanguageServerNotification(
            language,
            filePath,
            "textDocument/didOpen",
            async () => {
                this._currentTrackedFile = filePath
                const lines = await this._editorManager.activeEditor.activeBuffer.getLines()
                const text = lines.join(os.EOL)
                const version = this._editorManager.activeEditor.activeBuffer.version
                this._languageClientStatusBar.setStatus(LanguageClientState.Active)
                return Helpers.pathToTextDocumentItemParams(filePath, language, text, version)
            },
        )
    }

    private _getLanguageClient(language: string): ILanguageClient {
        if (!language) {
            return null
        }

        // Fix for #882 - handle cases like `javascript.jsx` where there is
        // some scoping to the filetype / language name
        const normalizedLanguage = language.split(".")[0]

        return this._languageServerInfo[normalizedLanguage]
    }

    private _hasLanguageClient(language: string): boolean {
        return !!this._languageServerInfo[language]
    }

    private _setStatus(protocolMessage: string, status: LanguageClientState): void {
        switch (protocolMessage) {
            case "textDocument/didOpen":
            case "textDocument/didChange":
                this._languageClientStatusBar.setStatus(status)
                break
            default:
                break
        }
    }

    private async _simulateFakeLag(): Promise<void> {
        const delay = this._configuration.getValue("debug.fakeLag.languageServer") as number
        if (!delay) {
            return
        } else {
            await Utility.delay(delay)
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

let _languageManager: LanguageManager = null

export const activate = (
    configuration: Oni.Configuration,
    editorManager: Oni.EditorManager,
    pluginManager: PluginManager,
    statusBar: Oni.StatusBar,
    workspace: IWorkspace,
): void => {
    _languageManager = new LanguageManager(
        configuration,
        editorManager,
        pluginManager,
        statusBar,
        workspace,
    )
}

export const getInstance = (): LanguageManager => {
    return _languageManager
}
