/**
 * Completion.ts
 */

import * as isEqual from "lodash/isEqual"
import { Observable } from "rxjs/Observable"

import { editorManager } from "./../EditorManager"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { configuration } from "./../Configuration"
import { languageManager, ILatestCursorAndBufferInfo } from "./../Language"
import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { createContextMenu } from "./CompletionMenu"
import * as CompletionUtility from "./CompletionUtility"

export interface ICompletionMeetInfo {
    language: string
    filePath: string
    meetLine: number
    meetPosition: number
    queryPosition: number
    meetBase: string
    shouldExpand: boolean
}

export interface ICompletionResults {
    completions: types.CompletionItem[]
    meetLine: number
    meetPosition: number
}

import { createStore } from "./CompletionStore"

export const initCompletionUI = (latestCursorAndBufferInfo$: Observable<ILatestCursorAndBufferInfo>, modeChanged$: Observable<Oni.Vim.Mode>) => {

    const store = createStore()

    createContextMenu(store)

    // Hook up BUFFER_ENTER events to the store
    latestCursorAndBufferInfo$
        .map((changeInfo) => ({
            language: changeInfo.language,
            filePath: changeInfo.filePath,
        }))
        .distinctUntilChanged(isEqual)
        .subscribe(({language, filePath}) => {
            store.dispatch({
                type: "BUFFER_ENTER",
                language,
                filePath,
            })
        })

    // Hook up CURSOR_MOVED events to the store
    latestCursorAndBufferInfo$
        .map((changeInfo) => ({
            line: changeInfo.cursorLine,
            lineContents: changeInfo.contents,
            column: changeInfo.cursorColumn,
        }))
        .distinctUntilChanged(isEqual)
        .subscribe(({column, line, lineContents}) => {
            console.log("Cursor moved!")
            store.dispatch({
                type: "CURSOR_MOVED",
                column,
                line,
                lineContents,
            })
        })

    // Hook up MODE_CHANGED events to the store
    modeChanged$
        .distinctUntilChanged()
        .subscribe((newMode: string) => {
            store.dispatch({
                type: "MODE_CHANGED",
                mode: newMode,
            })
        })
}

export const getCompletions = async (language: string, filePath: string, line: number, character: number): Promise<types.CompletionItem[]> => {

    if (!configuration.getValue("editor.completions.enabled")) {
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
        Log.debug(`[COMPLETION] Got completions: ${items}`)
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
