/**
 * SnippetCompletionProvider.ts
 *
 * Integrates snippets with completion provider
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"

import { CompletionsRequestContext, ICompletionsRequestor } from "./../Completion"
import { ISnippet } from "./ISnippet"
import { SnippetManager } from "./SnippetManager"

export const convertSnippetToCompletionItem = (snippet: ISnippet): types.CompletionItem => ({
    insertTextFormat: types.InsertTextFormat.Snippet,
    insertText: snippet.body,
    label: snippet.prefix + " (snippet)",
    detail: snippet.description,
    documentation: snippet.body,
    kind: types.CompletionItemKind.Snippet,
})

export class SnippetCompletionProvider implements ICompletionsRequestor {
    constructor(private _snippetManager: SnippetManager) {}

    public async getCompletions(
        context: CompletionsRequestContext,
    ): Promise<types.CompletionItem[]> {
        Log.verbose("[SnippetCompletionProvider::getCompletions] Starting...")

        const snippets = await this._snippetManager.getSnippetsForLanguage(context.language)
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
