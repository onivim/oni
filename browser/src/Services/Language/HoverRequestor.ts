/**
 * HoverRequestor.ts
 *
 * Abstraction over the action of requesting a definition
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { Configuration } from "./../Configuration"

import { LanguageManager } from "./LanguageManager"

import { DiagnosticsDataSource, IDiagnosticsDataSource } from "./Diagnostics"

export interface IHoverResult {
    hover: types.Hover
    errors: types.Diagnostic[]
}

export interface IHoverRequestor {
    getHover(fileLanguage: string, filePath: string, line: number, column: number): Promise<IHoverResult>
}

export class LanguageServiceHoverRequestor {

    constructor(
        private _languageManager: LanguageManager,
        private _configuration: Configuration,
        private _diagnostics: IDiagnosticsDataSource = new DiagnosticsDataSource(),
    ) { }

    public async getHover(language: string, filePath: string, line: number, column: number): Promise<IHoverResult> {
        if (!this._configuration.getValue("editor.quickInfo.enabled")) {
            return {
                hover: null,
                errors: [],
            }
        }

        const args = { ...Helpers.createTextDocumentPositionParams(filePath, line, column) }

        let result: types.Hover = null

        if (this._languageManager.isLanguageServerAvailable(language)) {
            try {
                result = await this._languageManager.sendLanguageServerRequest(language, filePath, "textDocument/hover", args)
            } catch (ex) {
                Log.warn(ex)
            }
        }

        const latestErrors = this._diagnostics.getErrorsForPosition(filePath, line, column)

        return {
            hover: result,
            errors: latestErrors,
        }
    }
}
