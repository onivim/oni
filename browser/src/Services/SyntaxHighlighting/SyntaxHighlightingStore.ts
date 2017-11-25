/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as types from "vscode-languageserver-types"

import { StackElement } from "vscode-textmate"

import * as Log from "./../../Log"
import * as PeriodicJobs from "./../../PeriodicJobs"

import { configuration } from "./../Configuration"

import { GrammarLoader } from "./GrammarLoader"
import { SyntaxHighlightingPeriodicJob } from "./SyntaxHighlightingPeriodicJob"
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
    dirty: boolean,
}

export interface SyntaxHighlightLines {[key: number]: ISyntaxHighlightLineInfo}

export interface IBufferSyntaxHighlightState {
    bufferId: string
    language: string

    // This doesn't work quite right if we have a buffer open in a separate window...
    topVisibleLine: number
    bottomVisibleLine: number

    // When in insert mode, we'll just syntax highlight that line
    // Upon leaving insert mode, we'll refresh the whole view
    activeInsertModeLine: number

    lines: SyntaxHighlightLines
}

export interface ISyntaxHighlightState {
    isInsertMode: boolean
    bufferToHighlights: {
        [bufferId: string]: IBufferSyntaxHighlightState,
    }
}

export type ISyntaxHighlightAction = {
    type: "SYNTAX_UPDATE_BUFFER",
    language: string
    bufferId: string,
    lines: string[],
} | {
        type: "SYNTAX_UPDATE_BUFFER_LINE",
        language: string
        bufferId: string,
        lineNumber: number,
        line: string,
    } | {
        type: "SYNTAX_UPDATE_TOKENS_FOR_LINE",
        bufferId: string,
        lineNumber: number,
        tokens: ISyntaxHighlightTokenInfo[],
        ruleStack: StackElement,
    } | {
        type: "SYNTAX_UPDATE_BUFFER_VIEWPORT",
        bufferId: string,
        topVisibleLine: number,
        bottomVisibleLine: number,
    } | {
        type: "START_INSERT_MODE",
        bufferId: string
    }

import { applyMiddleware, createStore, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"
import { reducer } from "./SyntaxHighlightingReducer"

const nullAction: any = { type: null }

const grammarLoader = new GrammarLoader()

const fullBufferUpdateEpic: Epic<ISyntaxHighlightAction, ISyntaxHighlightState> = (action$, store) =>
    action$.ofType("SYNTAX_UPDATE_BUFFER", "SYNTAX_UPDATE_BUFFER_LINE", "SYNTAX_UPDATE_BUFFER_VIEWPORT")
        .flatMap(async (action) => {

            const bufferId = action.bufferId
            const state = store.getState()

            const language = state.bufferToHighlights[bufferId].language

            if (!language) {
                return nullAction
            }

            const grammar = await grammarLoader.getGrammarForLanguage(language)

            if (!grammar) {
                return nullAction
            }

            const buffer = state.bufferToHighlights[bufferId]

            if (Object.keys(buffer.lines).length >= configuration.getValue("experimental.editor.textMateHighlighting.maxLines")) {
                Log.info("[SyntaxHighlighting - fullBufferUpdateEpic]: Not applying syntax highlighting as the maxLines limit was exceeded")
                return nullAction
            }

            const relevantRange = Selectors.getRelevantRange(state, bufferId)

            syntaxHighlightingJobs.startJob(new SyntaxHighlightingPeriodicJob(
                store as any,
                action.bufferId,
                grammar,
                relevantRange.top,
                relevantRange.bottom,
            ))

            return nullAction
        })

export const createSyntaxHighlightStore = (): Store<ISyntaxHighlightState> => {

    const syntaxHighlightStore: Store<ISyntaxHighlightState> = createStore(reducer,
        applyMiddleware(createEpicMiddleware(combineEpics(
            fullBufferUpdateEpic,
        ))),
    )

    return syntaxHighlightStore
}
