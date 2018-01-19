/**
 * CodeActionsRequestor.ts
 *
 * Abstraction over the action of requesting code actions
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { LanguageManager } from "./LanguageManager"

export interface ICodeActionResult {
    commands: types.Command[]
}

export interface ICodeActionRequestor {
    getCodeActions(fileLanguage: string, filePath: string, range: types.Range, diagnostics?: types.Diagnostic[]): Promise<ICodeActionResult>
}

export class LanguageServiceCodeActionRequestor {

    constructor(
        private _languageManager: LanguageManager,
    ) { }

    public async getCodeActions(language: string, filePath: string, range: types.Range, diagnostics: types.Diagnostic[] = []): Promise<ICodeActionResult> {

        // const commands = [
        //     types.Command.create("command1", "command1"),
        //     types.Command.create("command2", "command2"),
        //     types.Command.create("command3", "command3"),
        // ]

        // return {
        //     commands,
        // }

        const result: ICodeActionResult = {
            commands: null
        }

        if (!range) {
            return result
        }

        // let result: types.Hover = null

        if (this._languageManager.isLanguageServerAvailable(language)) {
            let commands: types.Command[] = null
            try {
                commands = await this._languageManager.sendLanguageServerRequest(language, filePath, "textDocument/codeAction", Helpers.eventContextToCodeActionParams(filePath, range))
            } catch (ex) {
                Log.warn(ex)
            }

            if (commands && commands.length > 0) {
                return {
                    commands,
                }
            }
        }

        return result
    }
}
