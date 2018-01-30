/**
 * HoverRequestor.ts
 *
 * Abstraction over the action of requesting a definition
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { LanguageManager } from "./LanguageManager"

import * as Diagnostics from "./../Diagnostics"

export interface IHoverResult {
    hover: types.Hover
    errors: types.Diagnostic[]
}

export interface IHoverRequestor {
    getHover(
        fileLanguage: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<IHoverResult>
}

export class LanguageServiceHoverRequestor {
    constructor(private _languageManager: LanguageManager) {}

    public async getHover(
        language: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<IHoverResult> {
        const args = { ...Helpers.createTextDocumentPositionParams(filePath, line, column) }

        let result: types.Hover = null

        if (this._languageManager.isLanguageServerAvailable(language)) {
            try {
                result = await this._languageManager.sendLanguageServerRequest(
                    language,
                    filePath,
                    "textDocument/hover",
                    args,
                )
            } catch (ex) {
                Log.warn(ex)
            }
        }

        const latestErrors = Diagnostics.getInstance().getErrorsForPosition(filePath, line, column)

        return {
            hover: result,
            errors: latestErrors,
        }
    }
}
