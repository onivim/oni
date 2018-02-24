/**
 * CompletionsRequestor.ts
 *
 * Abstraction over the action of requesting completions
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { LanguageManager } from "./../Language"

export interface ICompletionsRequestor {
    getCompletions(
        fileLanguage: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<types.CompletionItem[]>
    getCompletionDetails(
        fileLanguage: string,
        filePath: string,
        completionItem: types.CompletionItem,
    ): Promise<types.CompletionItem>
}

export class LanguageServiceCompletionsRequestor implements ICompletionsRequestor {
    constructor(private _languageManager: LanguageManager) {}

    public async getCompletions(
        language: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<types.CompletionItem[]> {
        if (Log.isDebugLoggingEnabled()) {
            Log.debug(`[COMPLETION] Requesting completions at line ${line} and character ${column}`)
        }

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(filePath),
            },
            position: {
                line,
                character: column,
            },
        }
        let result = null
        try {
            result = await this._languageManager.sendLanguageServerRequest(
                language,
                filePath,
                "textDocument/completion",
                args,
            )
        } catch (ex) {
            Log.verbose(ex)
        }

        if (!result) {
            return null
        }

        const items = getCompletionItems(result)

        if (!items) {
            return null
        }

        if (Log.isDebugLoggingEnabled()) {
            Log.debug(`[COMPLETION] Got completions: ${items.length}`)
        }

        return items
    }

    public async getCompletionDetails(
        language: string,
        filePath: string,
        completionItem: types.CompletionItem,
    ): Promise<types.CompletionItem> {
        let result
        try {
            result = await this._languageManager.sendLanguageServerRequest(
                language,
                filePath,
                "completionItem/resolve",
                completionItem,
            )
        } catch (ex) {
            Log.verbose(ex)
        }

        if (!result) {
            return null
        }

        return result
    }
}

const getCompletionItems = (
    items: types.CompletionItem[] | types.CompletionList,
): types.CompletionItem[] => {
    if (!items) {
        return []
    }

    if (Array.isArray(items)) {
        return items
    } else {
        return items.items || []
    }
}
