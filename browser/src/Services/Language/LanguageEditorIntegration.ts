/**
 * LanguageEditorIntegration
 *
 * Responsible for listening to editor events,
 * and hooking up the language service functionality.
 */

import * as isEqual from "lodash/isEqual"
import { Observable } from "rxjs/Observable"

import * as types from "vscode-languageserver-types"

import { languageManager } from "./LanguageManager"
import { getCompletions } from "./Completion"

import * as AutoCompletionUtility from "./../AutoCompletionUtility"

export const addInsertModeLanguageFunctionality = ($bufferUpdates: Observable<Oni.EditorBufferChangedEventArgs>) => {

    const isSingleLineChange = (range: types.Range ) => {
        if (!range) {
            return false
        }

        return range.start.line === range.end.line ||
            (range.start.character === 0 && range.end.character === 0 && range.start.line === range.end.line - 1)
    }

    const $incrementalBufferUpdates = $bufferUpdates
        .filter((evt: Oni.EditorBufferChangedEventArgs) => {
            return evt.contentChanges && evt.contentChanges.length > 0 && isSingleLineChange(evt.contentChanges[0].range)
        })
        .mergeMap(async (evt: Oni.EditorBufferChangedEventArgs) => {

            const buffer = evt.buffer
            const changedLineNumber = evt.contentChanges[0].range.start.line
            const changedLines: string[] = await buffer.getLines(changedLineNumber, changedLineNumber + 1)
            const changedLine = changedLines[0]

            const cursorColumn = buffer.cursor.column

            console.log(`[COMPLETION] Line changed at ${changedLineNumber}:${cursorColumn} - ${changedLine}`)

            return {
                filePath: buffer.filePath,
                language: buffer.language,
                cursorLine: changedLineNumber,
                contents: changedLine,
                cursorColumn,
            }
        })



    const $currentCompletionMeet = $incrementalBufferUpdates
        .map((changeInfo) => {
            const token = languageManager.getTokenRegex(changeInfo.language)
            const meet = AutoCompletionUtility.getCompletionMeet(changeInfo.contents, changeInfo.cursorColumn, token)
            return {
                ...changeInfo,
                meetPosition: meet.position,
                meetBase: meet.base,
            }
        })
        .distinctUntilChanged(isEqual)


    const $completions = $currentCompletionMeet
        .map((bufferMeetInfo) => ({
            language: bufferMeetInfo.language,
            filePath: bufferMeetInfo.filePath,
            line: bufferMeetInfo.cursorLine,
            character: bufferMeetInfo.meetPosition
        }))
        .distinctUntilChanged(isEqual)
        .mergeMap((completionInfo: any) => {
            return Observable.defer(async () => {
                return await getCompletions(completionInfo.language, completionInfo.filePath, completionInfo.line, completionInfo.character)
            })
        })

    $completions.subscribe((newCompletions) => {
        console.log("[COMPLETION] --Got completions!")
        console.dir(newCompletions)
        console.log("[COMPLETION] --")
    })

}
