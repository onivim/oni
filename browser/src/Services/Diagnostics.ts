/**
 * Diagnostics.ts
 *
 * Integrates the `textDocument/publishDiagnostics` protocol with Oni's UI
 */

import * as types from "vscode-languageserver-types"

import * as UI from "./../UI"
import * as Selectors from "./../UI/Selectors"

import { ILanguageServerNotificationResponse, LanguageManager } from "./Language"

import * as Helpers from "./../Plugins/Api/LanguageClient/LanguageClientHelpers"

import * as Utility from "./../Utility"

interface IPublishDiagnosticsParams {
    uri: string
    diagnostics: types.Diagnostic[]
}

export interface IDiagnosticsDataSource {
    getErrorsForPosition(filePath: string, line: number, column: number): types.Diagnostic[]
}

export class DiagnosticsDataSource {
    public getErrorsForPosition(filePath: string, line: number, column: number): types.Diagnostic[] {
        const state: any = UI.store.getState()
        const errors = Selectors.getAllErrorsForFile(Utility.normalizePath(filePath), state.errors)

        return errors.filter((diagnostic) => {
            return Utility.isInRange(line, column, diagnostic.range)
        })
    }
}

export const activate = (languageManager: LanguageManager) => {
    languageManager.subscribeToLanguageServerNotification("textDocument/publishDiagnostics", (args: ILanguageServerNotificationResponse) => {
        const test = args.payload as IPublishDiagnosticsParams

        UI.Actions.setErrors(Helpers.unwrapFileUriPath(test.uri), "language-" + args.language, test.diagnostics)
    })
}
