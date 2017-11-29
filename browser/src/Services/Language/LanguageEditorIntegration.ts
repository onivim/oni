/**
 * LanguageEditorIntegration
 *
 * Responsible for listening to editor events,
 * and hooking up the language service functionality.
 */

// import * as isEqual from "lodash/isEqual"

import "rxjs/add/observable/never"
import { Observable } from "rxjs/Observable"

import { Store } from "redux"

import * as Oni from "oni-api"
import * as OniTypes from "oni-types"

import { editorManager } from "./../EditorManager"
// import * as Definition from "./Definition"
// import * as Hover from "./Hover"
import * as SignatureHelp from "./SignatureHelp"

import { createStore, ILanguageState } from "./LanguageStore"

// export const addNormalModeLanguageFunctionality = (bufferUpdates$: Observable<Oni.EditorBufferChangedEventArgs>, cursorMoved$: Observable<Oni.Cursor>, modeChanged$: Observable<string>) => {

export class LanguageEditorIntegration implements OniTypes.IDisposable {

    private _subscriptions: OniTypes.IDisposable[] = []
    private _store: Store<ILanguageState>

    constructor(private _editor: Oni.Editor) {

        this._store = createStore()

        const sub1 = this._editor.onModeChanged.subscribe((newMode: string) => {
            this._store.dispatch({
                type: "MODE_CHANGED",
                mode: newMode,
            })
        })

        const sub2 = this._editor.onBufferEnter.subscribe((bufferEvent: Oni.EditorBufferEventArgs) => {
            this._store.dispatch({
                type: "BUFFER_ENTER",
                filePath: bufferEvent.filePath,
                language: bufferEvent.language,
            })
        })

        // TODO: Promote cursor moved to API
        const sub3 = (<any>this._editor).onCursorMoved.subscribe((cursorMoveEvent: Oni.Cursor) => {
            this._store.dispatch({
                type: "CURSOR_MOVED",
                line: cursorMoveEvent.line,
                column: cursorMoveEvent.column,
            })
        })

        this._subscriptions = [sub1, sub2, sub3]
    }

    public dispose(): void {
        if (this._subscriptions && this._subscriptions.length) {
            this._subscriptions.forEach((disposable) => disposable.dispose())
            this._subscriptions = null
        }
    }
}

//     const latestPositionAndVersion$ =
//         bufferUpdates$
//            .combineLatest(cursorMoved$, modeChanged$)
//            .map((combined: any[]) => {
//                 const [bufferEvent, cursorPosition, mode] = combined
//                 return {
//                     language: bufferEvent.buffer.language,
//                     filePath: bufferEvent.buffer.filePath,
//                     version: bufferEvent.buffer.version,
//                     line: cursorPosition.line,
//                     column: cursorPosition.column,
//                     mode,
//                 }
//            })
//            .distinctUntilChanged(isEqual)

//     const shouldUpdateNormalModeAdorners$ = latestPositionAndVersion$
//         .withLatestFrom(modeChanged$)
//         .filter((combinedArgs: [any, string]) => {
//             const [, mode] = combinedArgs
//             return mode === "normal"
//         })
//         .map((combinedArgs: [any, string]) => {
//             const [val ] = combinedArgs
//             return val
//         })

//     Definition.initDefinitionUI(latestPositionAndVersion$, shouldUpdateNormalModeAdorners$)
//     Hover.initHoverUI(latestPositionAndVersion$, shouldUpdateNormalModeAdorners$)
// }

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

    SignatureHelp.initUI(latestCursorAndBufferInfo$, modeChanged$)
}
