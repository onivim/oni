/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as types from "vscode-languageserver-types"

export interface ISyntaxHighlightTokenInfo {
    scopes: string[]
    range: types.Range
}

export interface IBufferSyntaxHighlightState {
    bufferId: string
    version: number
    lines: {
        [key: number]: ISyntaxHighlightTokenInfo[]
    }

export interface ISyntaxHighlightState {
    bufferToHighlights: {
        [bufferId: string]: IBufferSyntaxHighlightState
    }
}

export type ISyntaxHighlightAction = {
        type: "UPDATE_BUFFER",
        lines: string[]
    } | {
        type: "UPDATE_BUFFER_LINE",
        lineNumber: number
        line: string
    } | {
        type: "UPDATE_SYNTAX_FOR_LINE",
        lineNumber: number,
        tokens: ISyntaxHighlightTokenInfo[]
    }

const nullAction = { type: null } as ISyntaxHighlightAction

import { applyMiddleware, createStore, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

const reducer: Reducer<ISyntaxHighlightState> = (
    state: ISyntaxHighlightState {
        bufferToHighlights: { }
    },
    action: ISyntaxHighlightAction
) => {
    return state
}

const fullBufferUpdateEpic: Epic<ISyntaxHighlightAction, ISyntaxHighlightState> = (action$, store) =>
    action$.ofType("UPDATE_BUFFER")
        .map((action) => {
            return nullAction
        })


export const syntaxHighlightStore: Store<ISyntaxHighlightState> = createStore(reducer,
    applyMiddleware(createEpicMiddleware(combineEpics(
        fullBufferUpdateEpic
    )))
)
