/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as types from "vscode-languageserver-types"

import { StackElement } from "vscode-textmate"

import { getSyntaxTokensForBuffer } from "./getSyntaxTokensForBuffer"
import { GrammarLoader } from "./GrammarLoader"

export interface ISyntaxHighlightTokenInfo {
    scopes: string[]
    range: types.Range
}

export interface ISyntaxHighlightLineInfo {
    ruleStack: StackElement
    tokens: ISyntaxHighlightTokenInfo[]
    version: number
}

export interface IBufferSyntaxHighlightState {
    bufferId: string
    lines: {
        [key: number]: ISyntaxHighlightLineInfo,
    }
}

export interface ISyntaxHighlightState {
    bufferToHighlights: {
        [bufferId: string]: IBufferSyntaxHighlightState,
    }
}

export type ISyntaxHighlightAction = {
    type: "SYNTAX_UPDATE_BUFFER",
    language: string
    bufferId: string,
    lines: string[]
    version: number,
} | {
        type: "SYNTAX_UPDATE_BUFFER_LINE",
        language: string
        bufferId: string,
        lineNumber: number,
        line: string,
        version: number,
    } | {
        type: "SYNTAX_UPDATE_TOKENS_FOR_LINES",
        bufferId: string,
        updatedLines: { [key: number]: ISyntaxHighlightLineInfo },
    }

// const nullAction = { type: null } as ISyntaxHighlightAction

import { applyMiddleware, createStore, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

const reducer: Reducer<ISyntaxHighlightState> = (
    state: ISyntaxHighlightState = {
        bufferToHighlights: {},
    },
    action: ISyntaxHighlightAction,
) => {

    return {
        ...state,
        bufferToHighlights: bufferToHighlightsReducer(state.bufferToHighlights, action),
    }
}

const bufferToHighlightsReducer: Reducer<{ [bufferId: string]: IBufferSyntaxHighlightState }> = (
    state: { [bufferId: string]: IBufferSyntaxHighlightState } = {},
    action: ISyntaxHighlightAction,
) => {
    return {
        ...state,
        [action.bufferId]: bufferReducer(state[action.bufferId], action),
    }
}

const bufferReducer: Reducer<IBufferSyntaxHighlightState> = (
    state: IBufferSyntaxHighlightState = {
        bufferId: null,
        lines: {},
    },
    action: ISyntaxHighlightAction,
) => {

    switch (action.type) {
        case "SYNTAX_UPDATE_TOKENS_FOR_LINES":
            return {
            ...state,
            bufferId: action.bufferId,
            lines: {
                ...state.lines,
                ...action.updatedLines,
            },
        }
        default:
        return state
    }
}

const nullAction: any = { type: null }

const grammarLoader = new GrammarLoader()

const fullBufferUpdateEpic: Epic<ISyntaxHighlightAction, ISyntaxHighlightState> = (action$, store) =>
    action$.ofType("SYNTAX_UPDATE_BUFFER")
        .flatMap(async (action) => {

            if (action.type !== "SYNTAX_UPDATE_BUFFER") {
                return nullAction
            }

            const grammar = await grammarLoader.getGrammarForLanguage(action.language)

            if (!grammar) {
                return nullAction
            }

            const update = await getSyntaxTokensForBuffer(grammar, 0, null)

            const ret: ISyntaxHighlightAction = {
                type: "SYNTAX_UPDATE_TOKENS_FOR_LINES",
                bufferId: update.bufferId,
                updatedLines: update.lines,
            }

            return ret
        })

export const createSyntaxHighlightStore = (): Store<ISyntaxHighlightState> => {

    const syntaxHighlightStore: Store<ISyntaxHighlightState> = createStore(reducer,
        applyMiddleware(createEpicMiddleware(combineEpics(
            fullBufferUpdateEpic,
        ))),
    )

    return syntaxHighlightStore
}
