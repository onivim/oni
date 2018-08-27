/**
 * LanguageEditorIntegration
 *
 * Responsible for listening to editor events,
 * and hooking up the language service functionality.
 */

import "rxjs/add/observable/never"
import { Observable } from "rxjs/Observable"

import * as Oni from "oni-api"

import { editorManager } from "./../EditorManager"
import * as SignatureHelp from "./SignatureHelp"

import { IToolTipsProvider } from "./../../Editor/NeovimEditor/ToolTipsProvider"

export interface ILatestCursorAndBufferInfo {
    filePath: string
    language: string
    cursorLine: number
    contents: string
    cursorColumn: number
}

export const addInsertModeLanguageFunctionality = (
    cursorMoved$: Observable<Oni.Cursor>,
    modeChanged$: Observable<Oni.Vim.Mode>,
    onScroll$: Observable<Oni.EditorBufferScrolledEventArgs>,
    toolTips: IToolTipsProvider,
) => {
    const latestCursorAndBufferInfo$: Observable<
        ILatestCursorAndBufferInfo
    > = cursorMoved$.mergeMap(async cursorPos => {
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

    SignatureHelp.initUI(latestCursorAndBufferInfo$, modeChanged$, onScroll$, toolTips)
}
