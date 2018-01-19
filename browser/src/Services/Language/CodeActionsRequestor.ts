/**
 * CodeActionsRequestor.ts
 *
 * Abstraction over the action of requesting code actions
 */

import * as types from "vscode-languageserver-types"

// import * as Log from "./../../Log"
// import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// import { LanguageManager } from "./LanguageManager"

// import * as Diagnostics from "./../Diagnostics"

export interface ICodeActionResult {
    commands: types.Command[]
}

export interface ICodeActionRequestor {
    getCodeActions(fileLanguage: string, filePath: string, range: types.Range, diagnostics?: types.Diagnostic[]): Promise<ICodeActionResult>
}

export class LanguageServiceCodeActionRequestor {

    constructor(
        // private _languageManager: LanguageManager,
    ) { }

    public async getCodeActions(language: string, filePath: string, range: types.Range, diagnostics: types.Diagnostic[] = []): Promise<ICodeActionResult> {

        const commands = [
            types.Command.create("command1", "command1"),
            types.Command.create("command2", "command2"),
            types.Command.create("command3", "command3"),
        ]

        return {
            commands,
        }

        // const args = { ...Helpers.createTextDocumentPositionParams(filePath, line, column) }

        // let result: types.Hover = null

        // if (this._languageManager.isLanguageServerAvailable(language)) {
        //     try {
        //         result = await this._languageManager.sendLanguageServerRequest(language, filePath, "textDocument/hover", args)
        //     } catch (ex) {
        //         Log.warn(ex)
        //     }
        // }

        // const latestErrors = Diagnostics.getInstance().getErrorsForPosition(filePath, line, column)

        // return {
        //     hover: result,
        //     errors: latestErrors,
        // }
    }
}
