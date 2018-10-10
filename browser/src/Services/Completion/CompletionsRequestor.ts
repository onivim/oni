/**
 * CompletionsRequestor.ts
 *
 * Abstraction over the action of requesting completions
 */

import * as types from "vscode-languageserver-types"

import * as Log from "oni-core-logging"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { LanguageManager } from "./../Language"
import { IServerCapabilities } from "./../Language/ServerCapabilities"

export interface CompletionsRequestContext {
    language: string
    filePath: string
    line: number
    column: number
    meetCharacter: string
    textMateScopes: string[]
}

export interface ICompletionsRequestor {
    getCompletions(completionContext: CompletionsRequestContext): Promise<types.CompletionItem[]>
    getCompletionDetails(
        fileLanguage: string,
        filePath: string,
        completionItem: types.CompletionItem,
    ): Promise<types.CompletionItem>
}

export class LanguageServiceCompletionsRequestor implements ICompletionsRequestor {
    constructor(private _languageManager: LanguageManager) {}

    public async getCompletions(
        context: CompletionsRequestContext,
    ): Promise<types.CompletionItem[]> {
        if (Log.isDebugLoggingEnabled()) {
            Log.debug(
                `[COMPLETION] Requesting completions at line ${context.line} and character ${
                    context.column
                }`,
            )
        }

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(context.filePath),
            },
            position: {
                line: context.line,
                character: context.column,
            },
        }
        let result = null
        try {
            result = await this._languageManager.sendLanguageServerRequest(
                context.language,
                context.filePath,
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
        const caps: IServerCapabilities = await this._languageManager.getCapabilitiesForLanguage(
            language,
        )
        if (!caps.completionProvider.resolveProvider) {
            return completionItem
        }
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
