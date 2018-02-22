/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import { Store } from "redux"
import * as types from "vscode-languageserver-types"
import { StackElement } from "vscode-textmate"

import * as Log from "./../../Log"
import * as PeriodicJobs from "./../../PeriodicJobs"
import { createStore } from "./../../Redux"
import { configuration } from "./../Configuration"

import { GrammarLoader } from "./GrammarLoader"
import { SyntaxHighlightingPeriodicJob } from "./SyntaxHighlightingPeriodicJob"
import { reducer } from "./SyntaxHighlightingReducer"
import * as Selectors from "./SyntaxHighlightSelectors"

const syntaxHighlightingJobs = new PeriodicJobs.PeriodicJobManager()

export interface ISyntaxHighlightTokenInfo {
    scopes: string[]
    range: types.Range
}

export interface ISyntaxHighlightLineInfo {
    line: string
    ruleStack: StackElement
    tokens: ISyntaxHighlightTokenInfo[]
    dirty: boolean
}

export interface InsertModeState {
    line: number
    bufferId: string
    lineInfo: ISyntaxHighlightLineInfo
}

export interface SyntaxHighlightLines {
    [key: number]: ISyntaxHighlightLineInfo
}

// This tracks the last insert-mode line modified
export interface InsertModeLineState {
    version: number
    info: ISyntaxHighlightLineInfo
}

export interface IBufferSyntaxHighlightState {
    bufferId: string
    language: string
    extension: string
    version: number

    // This doesn't work quite right if we have a buffer open in a separate window...
    topVisibleLine: number
    bottomVisibleLine: number

    insertModeLine: InsertModeLineState | null

    lines: SyntaxHighlightLines
}

export interface ISyntaxHighlightState {
    bufferToHighlights: {
        [bufferId: string]: IBufferSyntaxHighlightState
    }
}

export const DefaultSyntaxHighlightState: ISyntaxHighlightState = {
    bufferToHighlights: {},
}

export type ISyntaxHighlightAction =
    | {
          type: "SYNTAX_UPDATE_BUFFER"
          language: string
          extension: string
          bufferId: string
          lines: string[]
          version: number
      }
    | {
          type: "SYNTAX_UPDATE_BUFFER_LINE"
          bufferId: string
          lineNumber: number
          line: string
          version: number
      }
    | {
          type: "SYNTAX_UPDATE_TOKENS_FOR_LINE"
          bufferId: string
          lineNumber: number
          tokens: ISyntaxHighlightTokenInfo[]
          ruleStack: StackElement
      }
    | {
          type: "SYNTAX_UPDATE_BUFFER_VIEWPORT"
          bufferId: string
          topVisibleLine: number
          bottomVisibleLine: number
      }

const grammarLoader = new GrammarLoader()

// Middleware that handles insert-mode updates
// For insert-mode updates, we'll resolve them immediately and apply them ephemerally
const updateBufferLineMiddleware = (store: any) => (next: any) => (
    action: ISyntaxHighlightAction,
) => {
    const result: ISyntaxHighlightAction = next(action)

    if (action.type === "SYNTAX_UPDATE_BUFFER_LINE") {
        const state: ISyntaxHighlightState = store.getState()
        const bufferId = action.bufferId

        if (!state.bufferToHighlights[bufferId]) {
            return result
        }

        const buffer = state.bufferToHighlights[bufferId]

        const language = buffer.language
        const extension = buffer.extension

        if (!language || !extension) {
            return result
        }

        if (buffer.version > action.version) {
            return result
        }

        grammarLoader.getGrammarForLanguage(language, extension).then(grammar => {
            if (!grammar) {
                return
            }

            // We'll resolve the tokens for
            const previousRuleStack =
                action.lineNumber === 0 ? null : buffer.lines[action.lineNumber - 1].ruleStack
            const tokenizeResult = grammar.tokenizeLine(action.line, previousRuleStack)

            const tokens = tokenizeResult.tokens.map((t: any) => ({
                range: types.Range.create(
                    action.lineNumber,
                    t.startIndex,
                    action.lineNumber,
                    t.endIndex,
                ),
                scopes: t.scopes,
            }))

            // TODO: Specific insert mode line update
            console.log("Insert mode update: " + tokens + " | ")
        })
    }

    return result
}

const updateTokenMiddleware = (store: any) => (next: any) => (action: any) => {
    const result: ISyntaxHighlightAction = next(action)

    if (action.type === "SYNTAX_UPDATE_BUFFER" || action.type === "SYNTAX_UPDATE_BUFFER_VIEWPORT") {
        const state: ISyntaxHighlightState = store.getState()
        const bufferId = action.bufferId

        const language = state.bufferToHighlights[bufferId].language
        const extension = state.bufferToHighlights[bufferId].extension

        if (!language || !extension) {
            return result
        }

        grammarLoader.getGrammarForLanguage(language, extension).then(grammar => {
            if (!grammar) {
                return
            }

            const buffer = state.bufferToHighlights[bufferId]

            if (
                Object.keys(buffer.lines).length >=
                configuration.getValue("experimental.editor.textMateHighlighting.maxLines")
            ) {
                Log.info(
                    "[SyntaxHighlighting - fullBufferUpdateEpic]: Not applying syntax highlighting as the maxLines limit was exceeded",
                )
                return
            }

            const relevantRange = Selectors.getRelevantRange(state, bufferId)

            syntaxHighlightingJobs.startJob(
                new SyntaxHighlightingPeriodicJob(
                    store as any,
                    action.bufferId,
                    grammar,
                    relevantRange.top,
                    relevantRange.bottom,
                ),
            )
        })
    }

    return result
}

export const createSyntaxHighlightStore = (): Store<ISyntaxHighlightState> => {
    const syntaxHighlightStore: Store<ISyntaxHighlightState> = createStore(
        "SyntaxHighlighting",
        reducer,
        DefaultSyntaxHighlightState,
        [updateTokenMiddleware, updateBufferLineMiddleware],
    )

    return syntaxHighlightStore
}
