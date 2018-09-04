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

interface TokenRanking {
    depth: number
    highestRankedToken: TokenColor
}

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
    private readonly _SCOPE_PRIORITIES = {
        support: 1,
    }

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

    private _isBannedScope = (scope: string) => {
        return scope.includes(this._BANNED_TOKEN)
    }

    private _mapTokensToHighlights(tokens: ISyntaxHighlightTokenInfo[]): HighlightInfo[] {
        const mapTokenToHighlight = (token: ISyntaxHighlightTokenInfo) => ({
            tokenColor: this._getHighlightGroupFromScope(token.scopes),
            range: token.range,
        })

        return tokens.map(mapTokenToHighlight).filter(t => !!t.tokenColor)
    }

    private _getPriority = (token: TokenColor) => {
        const priorities = Object.keys(this._SCOPE_PRIORITIES)
        return priorities.reduce(
            (acc, priority) =>
                token.scope.includes(priority) && this._SCOPE_PRIORITIES[priority] < acc.priority
                    ? { priority: this._SCOPE_PRIORITIES[priority], token }
                    : acc,
            { priority: 0, token },
        )
    }

    // Assign each token a priority based on `SCOPE_PRIORITIES` and then sort by priority
    // take the first aka the highest priority one
    private _determinePrecence(...tokens: TokenColor[]): TokenColor {
        const [{ token }] = tokens
            .map(this._getPriority)
            .sort((prev, next) => next.priority - prev.priority)
        return token
    }

    /** If more than one scope selector matches the current scope then they are ranked
     * according to how “good” a match they each are. The winner is the scope selector
     * which (in order of precedence):
     * 1. Match the element deepest down in the scope e.g.
     *    string wins over source.php when the scope is source.php string.quoted.
     * 2. Match most of the deepest element e.g. string.quoted wins over string.
     * 3. Rules 1 and 2 applied again to the scope selector when removing the deepest element
     *    (in the case of a tie), e.g. text source string wins over source string.
     *
     * Reference: https://macromates.com/manual/en/scope_selectors
     */
    private _rankTokenScopes(scopes: string[], themeColors: TokenColor[]): TokenColor {
        const { highestRankedToken } = scopes.reduce(
            (highestSoFar, scope) => {
                // TODO: if the lowest scope level doesn't match then we should
                // go up one level aka constant.numeric.special -> constant.numeric
                // and search the theme colors for a match
                const matchingToken = themeColors.find(color => color.scope === scope)
                if (this._isBannedScope(scope) || !matchingToken) {
                    return highestSoFar
                }

                const depth = scope.split(".").length
                if (depth === highestSoFar.depth) {
                    const highestPrecedence = this._determinePrecence(
                        matchingToken,
                        highestSoFar.highestRankedToken,
                    )
                    return { highestRankedToken: highestPrecedence, depth }
                }
                if (depth > highestSoFar.depth) {
                    return { highestRankedToken: matchingToken, depth }
                }
                return highestSoFar
            },
            { highestRankedToken: null, depth: null } as TokenRanking,
        )
        return highestRankedToken || null
    }

    private _getHighlightGroupFromScope(scopes: string[]): TokenColor {
        const configurationColors = this._tokenColors.tokenColors
        const highestRanked = this._rankTokenScopes(scopes, configurationColors)
        return highestRanked
    }
}
