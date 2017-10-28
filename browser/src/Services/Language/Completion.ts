/**
 * Completion.ts
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import * as AutoCompletionUtility from "./../AutoCompletionUtility"

export const getCompletions = async (language: string, filePath: string, line: number, character: number): Promise<types.CompletionItem[]> => {

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(filePath),
            },
            position: {
                line,
                character,
            },
        }

        let result
        try {
        result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/completion", args)
        } catch (ex) {
            return null
        }

        const items = getCompletionItems(result)

        if (!items) {
            return null
        }

        const completions = items.map((i) => _convertCompletionForContextMenu(i))

        return completions
}

export const resolveCompletionItem = async (language: string, filePath: string, completionItem: types.CompletionItem): Promise<types.CompletionItem> => {
    let result
    try {
        result = await languageManager.sendLanguageServerRequest(language, filePath, "completionItem/resolve", completionItem)
    } catch (ex) {
        return null
    }

    return _convertCompletionForContextMenu(result)
}

export const commitCompletion = async (line: number, originalLine: string, base: number, column: number, completion: string) => {

    const buffer = editorManager.activeEditor.activeBuffer

    const newLine = AutoCompletionUtility.replacePrefixWithCompletion(originalLine, base, column, completion)

    await buffer.setLines(line, line + 1, [newLine])

    const cursorOffset = newLine.length - originalLine.length

    await buffer.setCursorPosition(line, column + cursorOffset)
}

const convertKindToIconName = (completionKind: types.CompletionItemKind) => {

    switch (completionKind) {
            case types.CompletionItemKind.Class:
               return "cube"
            case types.CompletionItemKind.Color:
               return "paint-brush"
            case types.CompletionItemKind.Constructor:
               return "building"
            case types.CompletionItemKind.Enum:
               return "sitemap"
            case types.CompletionItemKind.Field:
               return "var"
            case types.CompletionItemKind.File:
               return "file"
            case types.CompletionItemKind.Function:
               return "cog"
            case types.CompletionItemKind.Interface:
               return "plug"
            case types.CompletionItemKind.Keyword:
               return "key"
            case types.CompletionItemKind.Method:
               return "flash"
            case types.CompletionItemKind.Module:
               return "cubes"
            case types.CompletionItemKind.Property:
               return "wrench"
            case types.CompletionItemKind.Reference:
               return "chain"
            case types.CompletionItemKind.Snippet:
               return "align-justify"
            case types.CompletionItemKind.Text:
               return "align-justify"
            case types.CompletionItemKind.Unit:
               return "tag"
            case types.CompletionItemKind.Value:
               return "lock"
            case types.CompletionItemKind.Variable:
               return "code"
            default:
                return "question"
    }
}

const getCompletionItems = (items: types.CompletionItem[] | types.CompletionList): types.CompletionItem[] => {
    if (!items) {
        return []
    }

    if (Array.isArray(items)) {
        return items
    } else {
        return items.items || []
    }
}

const getCompletionDocumentation = (item: types.CompletionItem): string | null => {
    if (item.documentation) {
        return item.documentation
    } else if (item.data && item.data.documentation) {
        return item.data.documentation
    } else {
        return null
    }
}

const _convertCompletionForContextMenu = (completion: types.CompletionItem): any => ({
    label: completion.label,
    detail: completion.detail,
    documentation: getCompletionDocumentation(completion),
    icon: convertKindToIconName(completion.kind),
    insertText: completion.insertText,
    rawCompletion: completion,
})
