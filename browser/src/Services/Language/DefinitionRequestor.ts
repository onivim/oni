/**
 * DefinitionRequestor.ts
 *
 * Abstraction over the action of requesting a definition
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { LanguageManager } from "./LanguageManager"

export interface IDefinitionResult {
    location: types.Location | null
    token: Oni.IToken | null
}

type Location = types.Location | types.Location[]

export interface IDefinitionRequestor {
    getDefinition(
        fileLanguage: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<IDefinitionResult>
}

export class LanguageServiceDefinitionRequestor {
    constructor(private _languageManager: LanguageManager, private _editor: Oni.Editor) {}

    public async getDefinition(
        fileLanguage: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<IDefinitionResult> {
        const args = { ...Helpers.createTextDocumentPositionParams(filePath, line, column) }

        const token = await this._editor.activeBuffer.getTokenAt(line, column)

        if (!token) {
            return {
                token: null,
                location: null,
            }
        }

        let result: Location = null
        try {
            result = await this._languageManager.sendLanguageServerRequest(
                fileLanguage,
                filePath,
                "textDocument/definition",
                args,
            )
        } catch (ex) {
            Log.warn(ex)
        }

        return {
            location: getFirstLocationFromArray(result),
            token,
        }
    }
}

export const getFirstLocationFromArray = (result: Location): types.Location => {
    if (!result) {
        return null
    }

    if (result instanceof Array) {
        if (!result.length) {
            return null
        }
        return result[0]
    }

    return result
}
