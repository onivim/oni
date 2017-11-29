/**
 * DefinitionRequestor.ts
 *
 * Abstraction over the action of requesting a definition
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { LanguageManager } from "./LanguageManager"

export interface IDefinitionRequestor {
    getDefinition(fileLanguage: string, filePath: string, line: number, column: number): Promise<types.Location>
}

export class LanguageServiceDefinitionRequestor {

    constructor(
        private _languageManager: LanguageManager
    ) { }

    public async getDefinition(fileLanguage: string, filePath: string, line: number, column: number): Promise<types.Location> {
        const args = { ...Helpers.createTextDocumentPositionParams(filePath, line, column) }

        let result = null
        try {
            result = await this._languageManager.sendLanguageServerRequest(fileLanguage, filePath, "textDocument/definition", args)
        } catch (ex) {
            Log.warn(ex)
        }

        return result
    }
}
