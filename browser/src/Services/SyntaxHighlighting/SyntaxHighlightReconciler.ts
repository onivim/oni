/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as throttle from "lodash/throttle"

import { configuration, Configuration } from "./../Configuration"

import { editorManager } from "./../EditorManager"
import { HighlightGroupId, HighlightInfo } from "./Definitions"
import { ISyntaxHighlightLineInfo, ISyntaxHighlightState, ISyntaxHighlightTokenInfo } from "./SyntaxHighlightingStore"

import * as Selectors from "./SyntaxHighlightSelectors"

import { Store, Unsubscribe } from "redux"

import * as Log from "./../../Log"

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

        this._unsubscribe = this._store.subscribe(throttle(() => {

            const state = this._store.getState()

            const activeBuffer: any = editorManager.activeEditor.activeBuffer

            if (!activeBuffer) {
                return
            }

            const bufferId = activeBuffer.id

            const currentHighlightState = state.bufferToHighlights[bufferId]

            if (currentHighlightState && currentHighlightState.lines) {
                const lineNumbers = Object.keys(currentHighlightState.lines)

                const relevantRange = Selectors.getRelevantRange(state, bufferId)

                const filteredLines = lineNumbers.filter((line) => {
                    const lineNumber = parseInt(line, 10)

                    // Ignore lines that are not in current view
                    if (lineNumber < relevantRange.top
                        || lineNumber > relevantRange.bottom) {
                        return false
                    }

                    const latestLine = currentHighlightState.lines[line]

                    // If dirty (haven't processed tokens yet) - skip
                    if (latestLine.dirty) {
                        return false
                    }

                    // Or lines that haven't been updated
                    return this._previousState[line] !== currentHighlightState.lines[line]
                })

                const tokens = filteredLines.map((li) => {
                    const line = currentHighlightState.lines[li]

                    const highlights = this._mapTokensToHighlights(line.tokens)
                    return {
                        line: parseInt(li, 10),
                        highlights,
                    }
                })

                filteredLines.forEach((li) => {
                    this._previousState[li] = currentHighlightState.lines[li]
                })

                if (tokens.length > 0) {
                    Log.verbose("[SyntaxHighlightReconciler] Applying changes to " + tokens.length + " lines.")
                    activeBuffer.updateHighlights((highlightUpdater: any) => {
                        tokens.forEach((token) => {
                            const line = token.line
                            const highlights = token.highlights

                            if (Log.isDebugLoggingEnabled()) {
                                Log.debug("[SyntaxHighlightingReconciler] Updating tokens for line: " + token.line + " | " + JSON.stringify(highlights))
                            }

                            highlightUpdater.setHighlightsForLine(line, highlights)
                        })
                    })
                }
            }
        }, 100))
    }

    public dispose(): void {
        if (this._unsubscribe) {
            this._unsubscribe()
            this._unsubscribe = null
        }
    }

    private _mapTokensToHighlights(tokens: ISyntaxHighlightTokenInfo[]): HighlightInfo[] {

        const mapTokenToHighlight = (token: ISyntaxHighlightTokenInfo) => ({
            highlightGroup: this._getHighlightGroupFromScope(token.scopes),
            range: token.range,
        })

        return tokens.map(mapTokenToHighlight)
                .filter((t) => !!t.highlightGroup)
    }

    private _getHighlightGroupFromScope(scopes: string[]): HighlightGroupId {

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
