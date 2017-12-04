/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { IDisposable } from "oni-types"

import { Store } from "redux"

import { createSyntaxHighlightStore, ISyntaxHighlightState, ISyntaxHighlightTokenInfo } from "./SyntaxHighlightingStore"

import { SyntaxHighlightReconciler } from "./SyntaxHighlightReconciler"

import * as Log from "./../../Log"
import * as Utility from "./../../Utility"

export interface ISyntaxHighlighter extends IDisposable {
    notifyBufferUpdate(evt: Oni.EditorBufferChangedEventArgs): Promise<void>
    notifyViewportChanged(bufferId: string, topLineInView: number, bottomLineInView: number): void
    notifyStartInsertMode(buffer: Oni.Buffer): void
    notifyEndInsertMode(buffer: Oni.Buffer): void

    getHighlightTokenAt(bufferId: string, position: types.Position): ISyntaxHighlightTokenInfo
}

export class SyntaxHighlighter implements ISyntaxHighlighter {

    private _store: Store<ISyntaxHighlightState>
    private _reconciler: SyntaxHighlightReconciler

    constructor() {
        this._store = createSyntaxHighlightStore()
        this._reconciler = new SyntaxHighlightReconciler(this._store)
    }

    public notifyViewportChanged(bufferId: string, topLineInView: number, bottomLineInView: number): void {

        Log.verbose("[SyntaxHighlighting.notifyViewportChanged] - bufferId: " + bufferId + " topLineInView: " + topLineInView + " bottomLineInView: " + bottomLineInView)

        const state = this._store.getState()
        const previousBufferState = state.bufferToHighlights[bufferId]

        if (previousBufferState && topLineInView === previousBufferState.topVisibleLine && bottomLineInView === previousBufferState.bottomVisibleLine) {
            return
        }

        this._store.dispatch({
            type: "SYNTAX_UPDATE_BUFFER_VIEWPORT",
            bufferId,
            topVisibleLine: topLineInView,
            bottomVisibleLine: bottomLineInView,
        })
    }

    public notifyStartInsertMode(buffer: Oni.Buffer): void {
        this._store.dispatch({
            type: "START_INSERT_MODE",
            bufferId: buffer.id,
        })
    }

    public async notifyEndInsertMode(buffer: any): Promise<void> {

        const lines = await buffer.getLines(0, buffer.lineCount, false)

        // const currentState = this._store.getState()

        // Send a full refresh of the lines
        this._store.dispatch({
            type: "END_INSERT_MODE",
            bufferId: buffer.id,
        })

        this._store.dispatch({
            type: "SYNTAX_UPDATE_BUFFER",
            extension: path.extname(buffer.filePath),
            language: buffer.language,
            bufferId: buffer.id,
            lines,
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
    public notifyStartInsertMode(buffer: Oni.Buffer): void {
        // tslint: disable-line
    }

    public notifyEndInsertMode(buffer: Oni.Buffer): void {
        // tslint: disable-line
    }

    public dispose(): void { } // tslint:disable-line
}
