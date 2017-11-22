/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as flatten from "lodash/flatten"

import { editorManager } from "./../EditorManager"
import { HighlightGroupId, HighlightInfo  } from "./Definitions"
import { ISyntaxHighlightLineInfo, ISyntaxHighlightState } from "./SyntaxHighlightingStore"

import { Store, Unsubscribe } from "redux"

// SyntaxHighlightReconciler
//
// Essentially a renderer / reconciler, that will push
// highlight calls to the active buffer based on the active
// window and viewport
export class SyntaxHighlightReconciler {

    private _unsubscribe: Unsubscribe

    private _previousState: { [line: number]: ISyntaxHighlightLineInfo} = {}

    constructor(
        private _store: Store<ISyntaxHighlightState>,
    ) {

        // TODO: Also listen to viewport change event

        this._unsubscribe = this._store.subscribe(() => {

            const state = this._store.getState()

            const activeBuffer: any = editorManager.activeEditor.activeBuffer

            const bufferId = activeBuffer.id

            const currentHighlightState = state.bufferToHighlights[bufferId]

            if (currentHighlightState && currentHighlightState.lines) {
                const lineNumbers = Object.keys(currentHighlightState.lines)

                const filteredLines = lineNumbers.filter((line) => {
                    return this._previousState[line] !== currentHighlightState.lines[line]
                })

                const allHighlights = filteredLines.map((li) => {
                    const line: ISyntaxHighlightLineInfo = currentHighlightState.lines[li]
                    return line.tokens
                })

                // TODO: Only set highlights for tokens in the viewable portion
                const consolidatedTokens = flatten(allHighlights)

                const tokensWithHighlights: any = consolidatedTokens.map((t): HighlightInfo => ({
                    highlightGroup: this._getHighlightGroupFromScope(t.scopes),
                    range: t.range,
                }))
                .filter((t) => !!t.highlightGroup)

                filteredLines.forEach((li) => {
                    this._previousState[li] = currentHighlightState.lines[li]
                })

                activeBuffer.setHighlights(tokensWithHighlights)
            }

        })

    }

    private _getHighlightGroupFromScope(/* TODO */scopes: string[]): HighlightGroupId {


        for (let i = 0; i < scopes.length; i++) {
            // if (scopes[i].indexOf("variable.object") === 0) {
            //     return "Identifier"
            // }
            // } else if (scopes[i].indexOf("variable.other.constant") === 0) {
            //     return "Constant"
            // } else if (scopes[i].indexOf("variable.other") === 0) {
            //     return "Identifier"
            // } else if (scopes[i].indexOf("variable.parameter") === 0) {
            //     return "Identifier"
            // } else if (scopes[i].indexOf("support.function") === 0) {
            //     return "Function"
            // } else if (scopes[i].indexOf("entity.name") === 0) {
            //     return "Special"
            // }
        }


        return null
    }

    public dispose(): void {
        if (this._unsubscribe) {
            this._unsubscribe()
            this._unsubscribe = null
        }
    }
}
