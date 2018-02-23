/**
 * SnippetCompletionProvider.ts
 *
 * Integrates snippets with completion provider
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"

import { ICompletionsRequestor } from "./../Completion"
import { SnippetManager } from "./SnippetManager"
import { ISnippet } from "./ISnippet"

export const convertSnippetToCompletionItem = (snippet: ISnippet): types.CompletionItem => ({
    insertTextFormat: types.InsertTextFormat.Snippet,
    insertText: snippet.body,
    label: snippet.prefix,
    detail: snippet.description,
})

export class SnippetCompletionProvider implements ICompletionsRequestor {
    constructor(private _snippetManager: SnippetManager) {}

    public async getCompletions(
        fileLanguage: string,
        filePath: string,
        line: number,
        column: number,
    ): Promise<types.CompletionItem[]> {
        Log.verbose("[SnippetCompletionProvider::getCompletions] Starting...")

        const snippets = await this._snippetManager.getSnippetsForLanguage(fileLanguage)
        Log.verbose(
            "[SnippetCompletionProvider::getCompletions] Got " + snippets.length + " snippets.",
        )

        const items = snippets.map(convertSnippetToCompletionItem)
        return items
    }

    public async getCompletionDetails(
        fileLanguage: string,
        fielPath: string,
        completionItem: types.CompletionItem,
    ): Promise<types.CompletionItem> {
        return completionItem
    }
}