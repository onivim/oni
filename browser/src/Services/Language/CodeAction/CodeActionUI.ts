/**
 * CodeActionUI.ts
 *
 * Helper for managing the UI for Code Action
 */

import * as types from "vscode-languageserver-types"

import * as isEqual from "lodash/isEqual"

import { createStore } from "./CodeActionStore"

import { Observable } from "rxjs/Observable"

import { editorManager } from "./../../EditorManager"

export const initCodeActionUI = (bufferUpdate$: Observable<Oni.EditorBufferChangedEventArgs>, cursorMoved$: Observable<Oni.Cursor>) => {

    const store = createStore()

    bufferUpdate$
        .map((bu) => ({
            filePath: bu.buffer.filePath,
            language: bu.buffer.language,
        }))
        .distinctUntilChanged(isEqual)
        .subscribe((bufferInfo) => {
            store.dispatch({
                type: "BUFFER_ENTER",
                language: bufferInfo.language,
                filePath: bufferInfo.filePath,
            })
        })

    cursorMoved$
        .mergeMap(async (cursor) => {
            return await editorManager.activeEditor.activeBuffer.getSelectionRange()
        })
        .distinctUntilChanged(isEqual)
        .subscribe((newRange: types.Range) => {
            store.dispatch({
                type: "SELECTION_CHANGED",
                range: newRange,
            })
        })


    store.subscribe(() => {
        console.dir(store.getState())
    })

}
