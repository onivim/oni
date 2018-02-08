/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import { Configuration } from "./../Configuration"

import { NeovimEditor } from "./../../Editor/NeovimEditor"

import { HighlightGroupId, HighlightInfo } from "./Definitions"
import {
    ISyntaxHighlightLineInfo,
    ISyntaxHighlightState,
    ISyntaxHighlightTokenInfo,
} from "./SyntaxHighlightingStore"
import { vimHighlightScopes } from "./tokenGenerator"

import * as Selectors from "./SyntaxHighlightSelectors"

import * as Log from "./../../Log"

// SyntaxHighlightReconciler
//
// Essentially a renderer / reconciler, that will push
// highlight calls to the active buffer based on the active
// window and viewport
export class SyntaxHighlightReconciler {
    private _previousState: { [line: number]: ISyntaxHighlightLineInfo } = {}

    constructor(private _configuration: Configuration, private _editor: NeovimEditor) {}

    public update(state: ISyntaxHighlightState) {
        const activeBuffer: any = this._editor.activeBuffer

        if (!activeBuffer) {
            return
        }

        const bufferId = activeBuffer.id

        const currentHighlightState = state.bufferToHighlights[bufferId]

        if (currentHighlightState && currentHighlightState.lines) {
            const lineNumbers = Object.keys(currentHighlightState.lines)

            const relevantRange = Selectors.getRelevantRange(state, bufferId)

            const filteredLines = lineNumbers.filter(line => {
                const lineNumber = parseInt(line, 10)

                // Ignore lines that are not in current view
                if (lineNumber < relevantRange.top || lineNumber > relevantRange.bottom) {
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

            const tokens = filteredLines.map(li => {
                const line = currentHighlightState.lines[li]

                const highlights = this._mapTokensToHighlights(line.tokens)
                return {
                    line: parseInt(li, 10),
                    highlights,
                }
            })

            filteredLines.forEach(li => {
                this._previousState[li] = currentHighlightState.lines[li]
            })

            if (tokens.length > 0) {
                Log.verbose(
                    "[SyntaxHighlightReconciler] Applying changes to " + tokens.length + " lines.",
                )
                activeBuffer.updateHighlights((highlightUpdater: any) => {
                    tokens.forEach(token => {
                        const line = token.line
                        const highlights = token.highlights

                        if (Log.isDebugLoggingEnabled()) {
                            Log.debug(
                                "[SyntaxHighlightingReconciler] Updating tokens for line: " +
                                    token.line +
                                    " | " +
                                    JSON.stringify(highlights),
                            )
                        }

                        highlightUpdater.setHighlightsForLine(line, highlights)
                    })
                })
            }
        }
    }

    private _mapTokensToHighlights(tokens: ISyntaxHighlightTokenInfo[]): HighlightInfo[] {
        const mapTokenToHighlight = (token: ISyntaxHighlightTokenInfo) => ({
            highlightGroup: this._getHighlightGroupFromScope(token.scopes),
            range: token.range,
        })

        const highlights = tokens.map(mapTokenToHighlight).filter(t => !!t.highlightGroup)
        return highlights
    }

    private _getHighlightGroupFromScope(scopes: string[]): HighlightGroupId {
        const configurationColors = this._configuration.getValue("editor.tokenColors")
        const tokens = Object.keys(configurationColors)

        for (const scope of scopes) {
            const match = tokens.find(token => scope.includes(token))

            for (const token in vimHighlightScopes) {
                if (vimHighlightScopes.hasOwnProperty(token)) {
                    const found = vimHighlightScopes[token].some((t: string) => t.includes(match))
                    if (found) {
                        return token
                    }
                }
            }
        }

        return null
    }
}
