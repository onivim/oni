/**
 * SnippetCompletionProvider.ts
 *
 * Integrates snippets with completion provider
 */

import * as Oni from "oni-api"

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"

import { CompletionsRequestContext, ICompletionsRequestor } from "./../Completion"
import { SnippetManager } from "./SnippetManager"

export const convertSnippetToCompletionItem = (
    snippet: Oni.Snippets.Snippet,
): types.CompletionItem => ({
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

        if (!context.meetCharacter) {
            return []
        }

        const commentsOrQuotedStrings = context.textMateScopes.filter(
            f => f.indexOf("comment.") === 0 || f.indexOf("string.quoted.") === 0,
        )
        if (commentsOrQuotedStrings.length) {
            return []
        }

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
