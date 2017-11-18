/**
 * CodeActionStore.ts
 *
 * State management for code actions
 */

import * as types from "vscode-languageserver-types"

import "rxjs/add/operator/mergeMap"
// import { Observable } from "rxjs/Observable"

import { applyMiddleware, createStore as reduxCreateStore, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import { getCodeActions } from "./CodeAction"

// import { languageManager } from "./../LanguageManager"

export interface ICodeActionQuery {
    language: string
    filePath: string
    range: types.Range
}

const NullRange = types.Range.create(-1, -1, -1, -1)

const DefaultCodeActionQuery: ICodeActionQuery = {
    language: null,
    filePath: null,
    range: NullRange,
}

export interface ICodeActionState {
    currentBufferPath: string,
    currentBufferLanguage: string,
    currentSelection: types.Range,
    lastQuery: ICodeActionQuery
    availableCodeActions: types.Command[]
}

export type CodeActionAction = {
    type: "SELECTION_CHANGED",
    range: types.Range
} | {
    type: "GET_CODE_ACTION_RESULT",
    queryParameters: ICodeActionQuery,
    actions: types.Command[]
} | {
    type: "BUFFER_ENTER",
    language: string,
    filePath: string,
}

const codeActionReducer: Reducer<ICodeActionState> = (
    state: ICodeActionState = {
        currentBufferPath: null,
        currentBufferLanguage: null,
        currentSelection: NullRange,
        lastQuery: DefaultCodeActionQuery,
        availableCodeActions: []
    },
    action: CodeActionAction
) => {
    switch (action.type) {
        case "GET_CODE_ACTION_RESULT":
            return {
            ...state,
            lastQuery: action.queryParameters,
            availableCodeActions: action.actions,
        }
        case "SELECTION_CHANGED":
            return {
            ...state,
            currentSelection: action.range,
        }
        case "BUFFER_ENTER":
            return {
            ...state,
            currentBufferPath: action.filePath,
            currentLanguage: action.language,
        }
        default:
            return state
    }
}

// const nullAction = { type: null } as CodeActionAction

const getCodeActionsEpic: Epic<CodeActionAction, ICodeActionState> = (action$, store) =>
    action$.ofType("SELECTION_CHANGED")
        .mergeMap(async (action: CodeActionAction) => {
            return await getCodeActions()
        })
        .map((result) => {
            return {
                type: "GET_CODE_ACTION_RESULT",
                queryParameters: result.query,
                actions: result.commands,
            } as CodeActionAction
        })


export const createStore = (): Store<ICodeActionState> => {
    return reduxCreateStore(
        codeActionReducer,
        applyMiddleware(createEpicMiddleware(combineEpics(
            getCodeActionsEpic
        )))
    )
}
