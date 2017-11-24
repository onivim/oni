/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as os from "os"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { IDisposable } from "oni-types"

import { Store } from "redux"

import { createSyntaxHighlightStore, ISyntaxHighlightState, ISyntaxHighlightTokenInfo } from "./SyntaxHighlightingStore"

import { SyntaxHighlightReconciler } from "./SyntaxHighlightReconciler"

import * as Utility from "./../../Utility"

export interface ISyntaxHighlighter extends IDisposable {
    notifyBufferUpdate(evt: Oni.EditorBufferChangedEventArgs): Promise<void>
    getHighlightTokenAt(bufferId: string, position: types.Position): ISyntaxHighlightTokenInfo
    notifyViewportChanged(bufferId: string, topLineInView: number, bottomLineInView: number): void
}

export class SyntaxHighlighter implements ISyntaxHighlighter {

    private _store: Store<ISyntaxHighlightState>
    private _reconciler: SyntaxHighlightReconciler

    constructor() {
        this._store = createSyntaxHighlightStore()
        this._reconciler = new SyntaxHighlightReconciler(this._store)
    }

    public notifyViewportChanged(bufferId: string, topLineInView: number, bottomLineInView: number): void {
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
                language: evt.buffer.language,
                bufferId: evt.buffer.id,
                lines,
            })
        } else {
            // Incremental update
            this._store.dispatch({
                type: "SYNTAX_UPDATE_BUFFER_LINE",
                bufferId: evt.buffer.id,
                lineNumber: firstChange.range.start.line,
                line: firstChange.text,
            })
        }
    }

    public getHighlightTokenAt(bufferId: string, position: types.Position): ISyntaxHighlightTokenInfo {

        const state = this._store.getState()
        const buffer = state.bufferToHighlights[bufferId]

        if (!buffer) {
            return null
        }

        const line = buffer.lines[position.line]

        if (!line) {
            return null
        }

        return line.tokens.find((r) => Utility.isInRange(position.line, position.character, r.range))
    }

    public dispose(): void {
        if (this._reconciler) {
            this._reconciler.dispose()
            this._reconciler = null
        }
    }
}

export class NullSyntaxHighlighter implements ISyntaxHighlighter {
    public notifyBufferUpdate(evt: Oni.EditorBufferChangedEventArgs): Promise<void> {
        return Promise.resolve(null)
    }

    public getHighlightTokenAt(bufferId: string, position: types.Position): ISyntaxHighlightTokenInfo {
        return null
    }

    public notifyViewportChanged(bufferId: string, topLineInView: number, bottomLineInView: number): void {
        // tslint: disable-line
    }

    public dispose(): void { } // tslint:disable-line
}
