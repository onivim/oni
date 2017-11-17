/**
 * Completion.ts
 */

import * as isEqual from "lodash/isEqual"
// import "rxjs/add/observable/combineLatest"
// import "rxjs/add/operator/withLatestFrom"
import { Observable } from "rxjs/Observable"

import { editorManager } from "./../../EditorManager"

import * as types from "vscode-languageserver-types"

import * as Log from "./../../../Log"
import * as Helpers from "./../../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { configuration } from "./../../Configuration"

import { ILatestCursorAndBufferInfo } from "./../LanguageEditorIntegration"
import { languageManager } from "./../LanguageManager"

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

    // TODO: Can we un-split latestCursorAndBufferInfo$ to bufferEnter$ and cursorMove$ observables?


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

    // Observable that gets full completion context (cursor positon + meet info)
    // const completionMeet$: Observable<ICompletionMeetInfo> = latestCursorAndBufferInfo$
    //     .map((changeInfo) => {
    //         const token = languageManager.getTokenRegex(changeInfo.language)
    //         const completionCharacters = languageManager.getCompletionTriggerCharacters(changeInfo.language)
    //         const meet = CompletionUtility.getCompletionMeet(changeInfo.contents, changeInfo.cursorColumn, token, completionCharacters)

    //         if (Log.isDebugLoggingEnabled()) {
    //             Log.debug(`[COMPLETION] Got meet at position: ${meet.position} with base: ${meet.base} - shouldExpand: ${meet.shouldExpandCompletions}`)
    //         }

    //         return {
    //             language: changeInfo.language,
    //             filePath: changeInfo.filePath,
    //             meetLine: changeInfo.cursorLine,
    //             meetPosition: meet.position,
    //             queryPosition: meet.positionToQuery,
    //             meetBase: meet.base,
    //             shouldExpand: meet.shouldExpandCompletions,
    //         }
    //     })

    // const completion$: Observable<ICompletionResults> = completionMeet$
    //     // Only check for completion if the meets have actually changed
    //     // requesting completions for the same spot
    //     .distinctUntilChanged(isEqual)
    //     .filter((info) => info.shouldExpand)
    //     .mergeMap((completionInfo: ICompletionMeetInfo) => {
    //         return Observable.defer(async () => {
    //             const results = await getCompletions(completionInfo.language, completionInfo.filePath, completionInfo.meetLine, completionInfo.queryPosition)

    //             if (!results || !results.length) {
    //                 return null
    //             }

    //             return {
    //                 completions: results,
    //                 meetLine: completionInfo.meetLine,
    //                 meetPosition: completionInfo.meetPosition,
    //             }
    //         })
    //     })

    // Core completion logic:
    // Take the latest completion info, meet info, and mode
    // and determine what to show in the context menu
    // const resolvedCompletion$ = Observable
    //     .combineLatest(completion$, completionMeet$)
    //     .map((args: [ICompletionResults, ICompletionMeetInfo]) => {

    //         const [completionInfo, meetInfo] = args
    //         return resolveCompletionsFromCurrentState(completionInfo, meetInfo)
    //     })

    // createCompletionMenu(completionMeet$, resolvedCompletion$, modeChanged$)
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
