/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as flatten from "lodash/flatten"

import { configuration, Configuration } from "./../Configuration"

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
        private _configuration: Configuration = configuration,
    ) {

        // TODO: Also listen to viewport change event

        this._unsubscribe = this._store.subscribe(() => {

            const state = this._store.getState()

            const activeBuffer: any = editorManager.activeEditor.activeBuffer

            if (!activeBuffer) {
                return
            }

            const bufferId = activeBuffer.id

            const currentHighlightState = state.bufferToHighlights[bufferId]

            if (currentHighlightState && currentHighlightState.lines) {
                const lineNumbers = Object.keys(currentHighlightState.lines)

                const filteredLines = lineNumbers.filter((line) => {

                    const lineNumber = parseInt(line)

                    // Ignore lines that are not in current view
                    if (lineNumber < currentHighlightState.topVisibleLine
                        || lineNumber > currentHighlightState.bottomVisibleLine) {
                        return false
                    }

                    return true
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

                if (tokensWithHighlights.length > 0) {
                    activeBuffer.setHighlights(tokensWithHighlights)
                }
            }
        })
    }

    public dispose(): void {
        if (this._unsubscribe) {
            this._unsubscribe()
            this._unsubscribe = null
        }
    }

    private _getHighlightGroupFromScope(/* TODO */scopes: string[]): HighlightGroupId {

        const configurationColors = this._configuration.getValue("editor.tokenColors")

        for (const scope of scopes) {
            const matchingRule = configurationColors.find((c: any) => scope.indexOf(c.scope) === 0)

            if (matchingRule) {
                // TODO: Convert to highlight group id
                return matchingRule.settings
            }
        }

        return null
    }
}
