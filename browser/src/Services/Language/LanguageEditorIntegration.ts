/**
 * LanguageEditorIntegration
 *
 * Responsible for listening to editor events,
 * and hooking up the language service functionality.
 */

import * as isEqual from "lodash/isEqual"
import { Observable } from "rxjs/Observable"

// import * as types from "vscode-languageserver-types"

import { contextMenuManager } from "./../ContextMenu"
import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"
import { commitCompletion, getCompletions } from "./Completion"

import * as AutoCompletionUtility from "./../AutoCompletionUtility"

export const addNormalModeLanguageFunctionality = ($bufferUpdates: Observable<Oni.EditorBufferChangedEventArgs>, $cursorMoved: Observable<Oni.Cursor>) => {

    const $latestPositionAndVersion =
        $bufferUpdates
           .combineLatest($cursorMoved)
           .map((combined: any[]) => {
                const [bufferEvent, cursorPosition] = combined
                return {
                    filePath: bufferEvent.buffer.filePath,
                    version: bufferEvent.buffer.version,
                    line: cursorPosition.line,
                    column: cursorPosition.column,
                }
           })
           .distinctUntilChanged(isEqual)
           .auditTime(250) // TODO: Use config setting

    $latestPositionAndVersion
        .subscribe((val) => {
            console.log("Normal mode language functionality: " + val)
        })

}

export const addInsertModeLanguageFunctionality = ($cursorMoved: Observable<Oni.Cursor>, $modeChanged: Observable<string>) => {

    // const isSingleLineChange = (range: types.Range ) => {
    //     if (!range) {
    //         return false
    //     }

    //     return range.start.line === range.end.line ||
    //         (range.start.character === 0 && range.end.character === 0 && range.start.line === range.end.line - 1)
    // }

    // const $incrementalBufferUpdates = $bufferUpdates
    //     .filter((evt: Oni.EditorBufferChangedEventArgs) => {
    //         return evt.contentChanges && evt.contentChanges.length > 0 && isSingleLineChange(evt.contentChanges[0].range)
    //     })
    //     .mergeMap(async (evt: Oni.EditorBufferChangedEventArgs) => {

    //         const buffer = evt.buffer
    //         const changedLineNumber = evt.contentChanges[0].range.start.line
    //         const changedLines: string[] = await buffer.getLines(changedLineNumber, changedLineNumber + 1)
    //         const changedLine = changedLines[0]

    //         const cursorColumn = buffer.cursor.column

    //         console.log(`[COMPLETION] Line changed at ${changedLineNumber}:${cursorColumn} - ${changedLine}`)

    //         return {
    //             filePath: buffer.filePath,
    //             language: buffer.language,
    //             cursorLine: changedLineNumber,
    //             contents: changedLine,
    //             cursorColumn,
    //         }
    //     })

    const $incrementalBufferUpdates = $cursorMoved
            .auditTime(25)
            .mergeMap(async (cursorPos) => {
                const editor = editorManager.activeEditor
                const buffer = editor.activeBuffer

                const changedLines: string[] = await buffer.getLines(cursorPos.line, cursorPos.line + 1)
                const changedLine = changedLines[0]
                return {
                    filePath: buffer.filePath,
                    language: buffer.language,
                    cursorLine: cursorPos.line,
                    contents: changedLine,
                    cursorColumn: cursorPos.column,
                }
            })


    const $currentCompletionMeet = $incrementalBufferUpdates
        .map((changeInfo) => {
            const token = languageManager.getTokenRegex(changeInfo.language)
            const meet = AutoCompletionUtility.getCompletionMeet(changeInfo.contents, changeInfo.cursorColumn, token)
            console.log(`[COMPLETION] Got meet at position: ${meet.position} with base: ${meet.base} - shouldExpand: ${meet.shouldExpandCompletions}`)
            return {
                ...changeInfo,
                meetPosition: meet.position,
                meetBase: meet.base,
                shouldExpand: meet.shouldExpandCompletions,
            }
        })
        .distinctUntilChanged(isEqual)

    let lastMeet: any = null

    $currentCompletionMeet.subscribe((newMeet) => { lastMeet = newMeet })

    const $baseChanged = $currentCompletionMeet
        .map((bufferMeetInfo) => {
            return {
                base: bufferMeetInfo.meetBase,
                shouldExpand: bufferMeetInfo.shouldExpand,
            }
        })
        .distinctUntilChanged(isEqual)

    const $completions = $currentCompletionMeet
        .map((bufferMeetInfo) => ({
            language: bufferMeetInfo.language,
            filePath: bufferMeetInfo.filePath,
            line: bufferMeetInfo.cursorLine,
            character: bufferMeetInfo.meetPosition,
            shouldExpand: bufferMeetInfo.shouldExpand,
        }))
        .distinctUntilChanged(isEqual)
        .filter((info) => info.shouldExpand)
        .mergeMap((completionInfo: any) => {
            return Observable.defer(async () => {
                console.log(`[COMPLETION] Requesting completions at line ${completionInfo.line} and character ${completionInfo.character}`)
                return await getCompletions(completionInfo.language, completionInfo.filePath, completionInfo.line, completionInfo.character)
            })
        })

    const newContextMenu = window["__contextMenu"] = contextMenuManager.create()
    newContextMenu.onItemSelected.subscribe((completionItem) => {
        const meetInfo = lastMeet
        if (meetInfo) {
            commitCompletion(meetInfo.cursorLine, meetInfo.contents, meetInfo.meetPosition, meetInfo.cursorColumn, completionItem.label)
            newContextMenu.hide()
        }
    })


    $baseChanged
        .subscribe((newBaseInfo) => {
            if (newBaseInfo.shouldExpand) {
              newContextMenu.setFilter(newBaseInfo.base)
            } else {
                newContextMenu.hide()
            }
        })

    $modeChanged.subscribe((mode) => {
        if (mode !== "i") {
            newContextMenu.setItems([])
            newContextMenu.hide()
        }
    })

    $completions
        .withLatestFrom($baseChanged)
        .subscribe((args: any[]) => {

        const [newCompletions, baseInfo] = args

        if (!newCompletions || !newCompletions.length) {
            newContextMenu.setItems([])
            newContextMenu.hide()
            console.log("[COMPLETION] None returned")
        } else {
            newContextMenu.show()
            newContextMenu.setItems(newCompletions)
            newContextMenu.setFilter(baseInfo.base)

            console.log("[COMPLETION] --Got completions!")
            console.dir(newCompletions)
            console.log("[COMPLETION] --")
        }

    })

}
