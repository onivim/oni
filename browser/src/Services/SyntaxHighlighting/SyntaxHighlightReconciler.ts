/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as Log from "oni-core-logging"

import { TokenColor, TokenColors } from "./../TokenColors"

import { NeovimEditor } from "./../../Editor/NeovimEditor"

import { HighlightInfo } from "./Definitions"
import {
    ISyntaxHighlightLineInfo,
    ISyntaxHighlightState,
    ISyntaxHighlightTokenInfo,
} from "./SyntaxHighlightingStore"

import * as Selectors from "./SyntaxHighlightSelectors"

// SyntaxHighlightReconciler
//
// Essentially a renderer / reconciler, that will push
// highlight calls to the active buffer based on the active
// window and viewport
export class SyntaxHighlightReconciler {
    private _previousState: { [line: number]: ISyntaxHighlightLineInfo } = {}
    // meta tokens are not intended for syntax highlighting but for other types of plugins
    // see: https://www.sublimetext.com/docs/3/scope_naming.html
    private _BANNED_TOKEN = "meta"

    constructor(private _editor: NeovimEditor, private _tokenColors: TokenColors) {}

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

                const latestLine = Selectors.getLineFromBuffer(currentHighlightState, lineNumber)

                // If dirty (haven't processed tokens yet) - skip
                if (latestLine.dirty) {
                    return false
                }

                // Or lines that haven't been updated
                return this._previousState[line] !== latestLine
            })

            const tokens = filteredLines.map(currentLine => {
                const lineNumber = parseInt(currentLine, 10)
                const line = Selectors.getLineFromBuffer(currentHighlightState, lineNumber)

                const highlights = this._mapTokensToHighlights(line.tokens)
                return {
                    line: parseInt(currentLine, 10),
                    highlights,
                }
            })

            filteredLines.forEach(line => {
                const lineNumber = parseInt(line, 10)
                this._previousState[line] = Selectors.getLineFromBuffer(
                    currentHighlightState,
                    lineNumber,
                )
            })

            if (tokens.length) {
                Log.verbose(
                    "[SyntaxHighlightReconciler] Applying changes to " + tokens.length + " lines.",
                )
                activeBuffer.updateHighlights(
                    this._tokenColors.tokenColors,
                    (highlightUpdater: any) => {
                        tokens.forEach(token => {
                            const { line, highlights } = token

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
                    },
                )
            }
        }
    }

    private _isBannedToken = (token: TokenColor) => {
        return !token.scope.includes(this._BANNED_TOKEN)
    }

    private _mapTokensToHighlights(tokens: ISyntaxHighlightTokenInfo[]): HighlightInfo[] {
        const mapTokenToHighlight = (token: ISyntaxHighlightTokenInfo) => ({
            tokenColor: this._getHighlightGroupFromScope(token.scopes),
            range: token.range,
        })

        return tokens.map(mapTokenToHighlight).filter(t => !!t.tokenColor)
    }

    private _getHighlightGroupFromScope(scopes: string[]): TokenColor {
        const configurationColors = this._tokenColors.tokenColors

        for (const scope of scopes) {
            const matchingRule = configurationColors.find(color => color.scope === scope)

            if (matchingRule && this._isBannedToken(matchingRule)) {
                // TODO: Convert to highlight group id
                return matchingRule
            }
        }

        return null
    }
}
