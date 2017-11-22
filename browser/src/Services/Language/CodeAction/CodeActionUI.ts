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

import { languageManager } from "./../LanguageManager"
import { contextMenuManager } from "./../../ContextMenu"

// TODO: Confine this to a closure
const contextMenu = contextMenuManager.create()
const store = createStore()

contextMenu.onItemSelected.subscribe(async (selectedItem) => {

    const state = store.getState()
    const { language, filePath } = state.lastQuery

    const commandName = selectedItem.data
    await languageManager.sendLanguageServerRequest(language, filePath, "workspace/executeCommand", { command: commandName })
})

export const expandCodeActions = () => {
    const codeActions = store.getState().availableCodeActions

    if (codeActions && codeActions.length) {
        const mapCommandsToItem = (command: types.Command, idx: number) => ({
            label: command.title,
            icon: "lightbulb-o",
            data: command.command,
            documentation: "Press enter to apply action.",
        })

        const contextMenuItems = codeActions.map(mapCommandsToItem)

        contextMenu.show(contextMenuItems)
    }
}

export const initCodeActionUI = (bufferUpdate$: Observable<Oni.EditorBufferChangedEventArgs>, cursorMoved$: Observable<Oni.Cursor>) => {
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

            const line0 = newRange.start.line
            const line1 = newRange.end.line

            const startLine = Math.min(line0, line1)
            const endLine = Math.max(line0, line1)

            // Clamp range to lines
            const adjustedRange = types.Range.create(startLine, 0, endLine + 1, 0)

            store.dispatch({
                type: "SELECTION_CHANGED",
                range: adjustedRange,
            })
        })

    store.subscribe(() => {
        console.dir(store.getState())
    })
}
