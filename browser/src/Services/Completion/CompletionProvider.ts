/**
 * Completion.ts
 */

import { editorManager } from "./../EditorManager"

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { configuration } from "./../Configuration"
import { languageManager } from "./../Language"

import * as CompletionUtility from "./CompletionUtility"

export const getCompletions = async (language: string, filePath: string, line: number, character: number): Promise<types.CompletionItem[]> => {

    if (configuration.getValue("editor.completions.mode") != "oni") {
        return null
    }

    if (Log.isDebugLoggingEnabled()) {
        Log.debug(`[COMPLETION] Requesting completions at line ${line} and character ${character}`)
    }

    const args = {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(filePath),
        },
        position: {
            line,
            character,
        },
    }
    let result = null
    try {
        result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/completion", args)
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

    const completions = items.map((i) => _convertCompletionForContextMenu(i))

    return completions
}

export const resolveCompletionItem = async (language: string, filePath: string, completionItem: types.CompletionItem): Promise<types.CompletionItem> => {
    let result
    try {
        result = await languageManager.sendLanguageServerRequest(language, filePath, "completionItem/resolve", completionItem)
    } catch (ex) {
        Log.verbose(ex)
    }

    if (!result) {
        return null
    }

    return _convertCompletionForContextMenu(result)
}

export const commitCompletion = async (line: number, base: number, completion: string) => {
    const buffer = editorManager.activeEditor.activeBuffer
    const currentLines = await buffer.getLines(line, line + 1)

    const column = buffer.cursor.column

    if (!currentLines || !currentLines.length) {
        return
    }

    const originalLine = currentLines[0]

    const newLine = CompletionUtility.replacePrefixWithCompletion(originalLine, base, column, completion)
    await buffer.setLines(line, line + 1, [newLine])
    const cursorOffset = newLine.length - originalLine.length
    await buffer.setCursorPosition(line, column + cursorOffset)
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
    icon: CompletionUtility.convertKindToIconName(completion.kind),
    insertText: completion.insertText,
    rawCompletion: completion,
})
