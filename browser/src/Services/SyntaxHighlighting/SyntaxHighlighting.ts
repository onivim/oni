/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as os from "os"
import * as path from "path"

import { Subject } from "rxjs/Subject"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { Store, Unsubscribe } from "redux"

import { TokenColors } from "./../TokenColors"

import { NeovimEditor } from "./../../Editor/NeovimEditor"

import { getLineFromBuffer } from "./SyntaxHighlightSelectors"

import {
    createSyntaxHighlightStore,
    ISyntaxHighlightAction,
    ISyntaxHighlightState,
    ISyntaxHighlightTokenInfo,
} from "./SyntaxHighlightingStore"

import { ISyntaxHighlighter } from "./ISyntaxHighlighter"
import { SyntaxHighlightReconciler } from "./SyntaxHighlightReconciler"

import * as Log from "./../../Log"
import * as Utility from "./../../Utility"

export class SyntaxHighlighter implements ISyntaxHighlighter {
    private _store: Store<ISyntaxHighlightState>
    private _reconciler: SyntaxHighlightReconciler
    private _unsubscribe: Unsubscribe

    private _throttledActions: Subject<ISyntaxHighlightAction> = new Subject<
        ISyntaxHighlightAction
    >()

    constructor(private _editor: NeovimEditor, private _tokenColors: TokenColors) {
        this._store = createSyntaxHighlightStore()

        this._reconciler = new SyntaxHighlightReconciler(this._editor, this._tokenColors)
        this._unsubscribe = this._store.subscribe(() => {
            const state = this._store.getState()
            this._reconciler.update(state)
        })

        this._throttledActions.auditTime(50).subscribe(action => {
            this._store.dispatch(action)
        })
    }

    public notifyViewportChanged(
        bufferId: string,
        topLineInView: number,
        bottomLineInView: number,
    ): void {
        Log.verbose(
            "[SyntaxHighlighting.notifyViewportChanged] - bufferId: " +
                bufferId +
                " topLineInView: " +
                topLineInView +
                " bottomLineInView: " +
                bottomLineInView,
        )

        const state = this._store.getState()
        const previousBufferState = state.bufferToHighlights[bufferId]

        if (
            previousBufferState &&
            topLineInView === previousBufferState.topVisibleLine &&
            bottomLineInView === previousBufferState.bottomVisibleLine
        ) {
            return
        }

        this._store.dispatch({
            type: "SYNTAX_UPDATE_BUFFER_VIEWPORT",
            bufferId,
            topVisibleLine: topLineInView,
            bottomVisibleLine: bottomLineInView,
        })
    }

    public async notifyBufferUpdate(evt: Oni.EditorBufferChangedEventArgs): Promise<void> {
        const firstChange = evt.contentChanges[0]
        if (!firstChange.range && !firstChange.rangeLength) {
            const lines = firstChange.text.split(os.EOL)
            this._store.dispatch({
                type: "SYNTAX_UPDATE_BUFFER",
                extension: path.extname(evt.buffer.filePath),
                language: evt.buffer.language,
                bufferId: evt.buffer.id,
                lines,
                version: evt.buffer.version,
            })
        } else {
            // Incremental update
            this._throttledActions.next({
                type: "SYNTAX_UPDATE_BUFFER_LINE",
                bufferId: evt.buffer.id,
                version: evt.buffer.version,
                lineNumber: firstChange.range.start.line,
                line: firstChange.text,
            })
        }
    }

    public getHighlightTokenAt(
        bufferId: string,
        position: types.Position,
    ): ISyntaxHighlightTokenInfo {
        const state = this._store.getState()
        const buffer = state.bufferToHighlights[bufferId]

        if (!buffer) {
            return null
        }

        const line = getLineFromBuffer(buffer, position.line)

        if (!line) {
            return null
        }

        return line.tokens.find(r => Utility.isInRange(position.line, position.character, r.range))
    }

    public dispose(): void {
        if (this._reconciler) {
            this._reconciler = null
        }

        if (this._unsubscribe) {
            this._unsubscribe()
            this._unsubscribe = null
        }
    }
}

export class NullSyntaxHighlighter implements ISyntaxHighlighter {
    public notifyBufferUpdate(evt: Oni.EditorBufferChangedEventArgs): Promise<void> {
        return Promise.resolve(null)
    }

    public getHighlightTokenAt(
        bufferId: string,
        position: types.Position,
    ): ISyntaxHighlightTokenInfo {
        return null
    }

    public notifyViewportChanged(
        bufferId: string,
        topLineInView: number,
        bottomLineInView: number,
    ): void {
        // tslint: disable-line
    }

    public dispose(): void {} // tslint:disable-line
}
