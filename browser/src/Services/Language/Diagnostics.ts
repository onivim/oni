/**
 * Diagnostics.ts
 *
 * Integrates the `textDocument/publishDiagnostics` protocol with Oni's UI
 */

import * as types from "vscode-languageserver-types"

import * as UI from "./../../UI"

import { ILanguageServerNotificationResponse, languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

interface IPublishDiagnosticsParams {
    uri: string
    diagnostics: types.Diagnostic[]
}

export const listenForDiagnostics = () => {
    languageManager.subscribeToLanguageServerNotification("textDocument/publishDiagnostics", (args: ILanguageServerNotificationResponse) => {
        const test = args.payload as IPublishDiagnosticsParams

        UI.Actions.setErrors(Helpers.unwrapFileUriPath(test.uri), "language-" + args.language, test.diagnostics)
    })
}
