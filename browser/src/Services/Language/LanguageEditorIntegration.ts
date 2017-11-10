/**
 * LanguageEditorIntegration
 *
 * Responsible for listening to editor events,
 * and hooking up the language service functionality.
 */

import * as isEqual from "lodash/isEqual"

import "rxjs/add/observable/never"
import { Observable } from "rxjs/Observable"

// import * as types from "vscode-languageserver-types"

import { editorManager } from "./../EditorManager"
import * as Completion from "./Completion"
import * as Definition from "./Definition"
import * as Hover from "./Hover"
import * as SignatureHelp from "./SignatureHelp"

export const addNormalModeLanguageFunctionality = (bufferUpdates$: Observable<Oni.EditorBufferChangedEventArgs>, cursorMoved$: Observable<Oni.Cursor>, modeChanged$: Observable<string>) => {

    const latestPositionAndVersion$ =
        bufferUpdates$
           .combineLatest(cursorMoved$, modeChanged$)
           .map((combined: any[]) => {
                const [bufferEvent, cursorPosition, mode] = combined
                return {
                    language: bufferEvent.buffer.language,
                    filePath: bufferEvent.buffer.filePath,
                    version: bufferEvent.buffer.version,
                    line: cursorPosition.line,
                    column: cursorPosition.column,
                    mode,
                }
           })
           .distinctUntilChanged(isEqual)

    const shouldUpdateNormalModeAdorners$ = latestPositionAndVersion$
        .withLatestFrom(modeChanged$)
        .filter((combinedArgs: [any, string]) => {
            const [, mode] = combinedArgs
            return mode === "normal"
        })
        .map((combinedArgs: [any, string]) => {
            const [val ] = combinedArgs
            return val
        })

    Definition.initDefinitionUI(latestPositionAndVersion$, shouldUpdateNormalModeAdorners$)
    Hover.initHoverUI(latestPositionAndVersion$, shouldUpdateNormalModeAdorners$)
}

export interface ILatestCursorAndBufferInfo {
    filePath: string,
    language: string,
    cursorLine: number,
    contents: string,
    cursorColumn: number,
}

export const addInsertModeLanguageFunctionality = (cursorMoved$: Observable<Oni.Cursor>, modeChanged$: Observable<Oni.Vim.Mode>) => {

    const latestCursorAndBufferInfo$: Observable<ILatestCursorAndBufferInfo> = cursorMoved$
            .auditTime(10)
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

    Completion.initCompletionUI(latestCursorAndBufferInfo$, modeChanged$)
    SignatureHelp.initUI(latestCursorAndBufferInfo$, modeChanged$)
}
