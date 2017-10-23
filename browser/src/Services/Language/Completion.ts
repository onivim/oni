/**
 * Completion.ts
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// import * as AutoCompletionUtility from "./../AutoCompletionUtility"

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
        } catch(ex) {
            return null
        }

        const items = getCompletionItems(result)

        if (!items) {
            return null
        }

        const completions = items.map((i) => ({
            label: i.label,
            detail: i.detail,
            documentation: getCompletionDocumentation(i),
            kind: i.kind,
            insertText: i.insertText,
        }))

        return completions
}


export const commitCompletion = async () => {
    console.log("todo")
    return Promise.resolve()
    // const completion =  UI.Selectors.getSelectedCompletion()

    // if (!completion) {
    //     return
    // }

    // const state = UI.store.getState() as State.IState

    // const buffer = editorManager.activeEditor.activeBuffer
    // const { line, column } = buffer.cursor

    // if (!state.autoCompletion || state.autoCompletion.line !== line)
    //     return

    // const base = state.autoCompletion.column
    // const lines = await buffer.getLines(line, line + 1)
    // const originalLine = lines[0]

    // const newLine = AutoCompletionUtility.replacePrefixWithCompletion(originalLine, base, column, completion)

    // await buffer.setLines(line, line + 1, [newLine])

    // const cursorOffset = newLine.length - originalLine.length

    // await buffer.setCursorPosition(line, column + cursorOffset)
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
