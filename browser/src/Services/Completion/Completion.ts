/**
 * Completion.ts
 */

import * as Oni from "oni-api"
import { IDisposable } from "oni-types"
import { Store } from "redux"
import { Subject } from "rxjs/Subject"

import { createContextMenu } from "./CompletionMenu"

import { ICompletionState } from "./CompletionState"

import { CompletionAction, createStore } from "./CompletionStore"

export class Completion implements IDisposable {

    private _lastCursorPosition: Oni.Cursor
    private _store: Store<ICompletionState>
    private _subscriptions: IDisposable[]

    private _throttledCursorUpdates: Subject<CompletionAction> = new Subject<CompletionAction>()

    constructor(
        private _editor: Oni.Editor,
    ) {
        this._store = createStore()
        this._throttledCursorUpdates
            .auditTime(10)
            .subscribe((update: CompletionAction) => {
                this._store.dispatch(update)
            })

        const sub1 = this._editor.onBufferEnter.subscribe((buf: Oni.Buffer) => {
            this._onBufferEnter(buf)
        })

        const sub2 = this._editor.onBufferChanged.subscribe((buf: Oni.EditorBufferChangedEventArgs) => {
            this._onBufferUpdate(buf)
        })

        const sub3 = this._editor.onModeChanged.subscribe((newMode: string) => {
            this._onModeChanged(newMode)
        })

        const sub4 = (this._editor as any).onCursorMoved.subscribe((cursor: Oni.Cursor) => {
            this._onCursorMoved(cursor)
        })

        this._subscriptions = [sub1, sub2, sub3, sub4]

        createContextMenu(this._store)
    }

    public dispose(): void {
        if (this._subscriptions) {
            this._subscriptions.forEach((disposable) => disposable.dispose())
            this._subscriptions = null
        }
    }

    private _onCursorMoved(cursor: Oni.Cursor): void {
        this._lastCursorPosition = cursor
    }

    private _onBufferEnter(buffer: Oni.Buffer): void {
        this._store.dispatch({
            type: "BUFFER_ENTER",
            language: buffer.language,
            filePath: buffer.filePath,
        })
    }

    private _onBufferUpdate(bufferUpdate: Oni.EditorBufferChangedEventArgs): void {

        // Ignore if this is a full update
        const firstChange = bufferUpdate.contentChanges[0]

        if (!firstChange || !firstChange.range) {
            return
        }

        const range = firstChange.range

        // We only work with single line changes, for now.
        // Perhaps we could get the latest line by querying the activeBuffer
        // from cursorMoved, but right now, the update comes _after_
        // the cursorMoved event - so this is the most reliable way.
        if (range.start.line + 1 !== range.end.line) {
            return
        }

        const newLine = firstChange.text

        if (range.start.line === this._lastCursorPosition.line) {
            this._throttledCursorUpdates.next({
                type: "CURSOR_MOVED",
                line: this._lastCursorPosition.line,
                column: this._lastCursorPosition.column,
                lineContents: newLine,
            })
        }
    }

    private async _onModeChanged(newMode: string): Promise<void> {
       if (newMode === "insert" && this._lastCursorPosition) {

            const [latestLine] = await this._editor.activeBuffer.getLines(this._lastCursorPosition.line, this._lastCursorPosition.line + 1)
            this._throttledCursorUpdates.next({
                type: "CURSOR_MOVED",
                line: this._lastCursorPosition.line,
                column: this._lastCursorPosition.column,
                lineContents: latestLine,
            })
        }

       this._store.dispatch({
            type: "MODE_CHANGED",
            mode: newMode,
        })
    }
}
