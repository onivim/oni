/**
 * LanguageStore.ts
 *
 * Manages state for UI-facing elements, like
 * hover & definition
 */

import * as types from "vscode-languageserver-types"

import "rxjs/add/observable/of"
import { Observable } from "rxjs/Observable"

// import * as Oni from "oni-api"

import { combineReducers, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

// import * as Log from "./../../Log"

import { createStore as oniCreateStore } from "./../../Redux"

import { IDefinitionRequestor, IDefinitionResult } from "./DefinitionRequestor"

// import { LanguageManager } from "./LanguageManager"

export interface ILocation {
    filePath: string
    language: string
    line: number
    column: number
}

export interface ILocationBasedResult<T> extends ILocation {
    result: T | null
}

export const DefaultLocationBasedResult: ILocationBasedResult<any> = {
    filePath: null,
    language: null,
    line: -1,
    column: -1,
    result: null
}

export interface IActiveBufferState {
    filePath: string
    language: string
}

export const DefaultActiveBuffer: IActiveBufferState = {
    filePath: null,
    language: null,
}

export interface ICursorPositionState {
    line: number
    column: number
}

export const DefaultCursorPosition: ICursorPositionState = {
    line: -1,
    column: -1,
}

export type HoverResult = ILocationBasedResult<types.Hover | null>
export type DefinitionResult = ILocationBasedResult<IDefinitionResult>

export interface ILanguageState {
    mode: string
    activeBuffer: IActiveBufferState
    cursor: ICursorPositionState
    hoverResult: HoverResult
    definitionResult: DefinitionResult
}

export const DefaultLanguageState: ILanguageState = {
    mode: "",
    activeBuffer: DefaultActiveBuffer,
    cursor: DefaultCursorPosition,
    hoverResult: DefaultLocationBasedResult,
    definitionResult: DefaultLocationBasedResult,
}

export type LanguageAction = {
    type: "MODE_CHANGED",
    mode: string
} | {
    type: "CURSOR_MOVED",
    line: number,
    column: number
} | {
    type: "BUFFER_ENTER",
    filePath: string,
    language: string
} | {
    type: "HOVER_QUERY",
    location: ILocation,
} | {
    type: "DEFINITION_QUERY",
    location: ILocation,
} | {
    type: "HOVER_QUERY_RESULT",
    result: ILocationBasedResult<types.Hover>
} | {
    type: "DEFINITION_QUERY_RESULT",
    result: ILocationBasedResult<IDefinitionResult>
}

export const modeReducer: Reducer<string> = (
    state: string = null,
    action: LanguageAction,
) => {
    switch (action.type) {
        case "MODE_CHANGED":
            return action.mode
        default:
            return state
    }
}

export const activeBufferReducer: Reducer<IActiveBufferState> = (
    state: IActiveBufferState = DefaultActiveBuffer,
    action: LanguageAction
) => {
    switch (action.type) {
        case "BUFFER_ENTER":
            return {
                ...state,
                filePath: action.filePath,
                language: action.language,
            }
        default:
            return state
    }
}

export const cursorMovedReducer: Reducer<ICursorPositionState> = (
    state: ICursorPositionState = DefaultCursorPosition,
    action: LanguageAction
) => {
    switch (action.type) {
        case "CURSOR_MOVED":
            return {
                ...state,
                line: action.line,
                column: action.column,
            }
        default:
            return state
    }
}

export const hoverResultReducer: Reducer<HoverResult> = (
    state: HoverResult = DefaultLocationBasedResult,
    action: LanguageAction,
) => {
    switch(action.type) {
        case "HOVER_QUERY_RESULT": 
            return action.result
        case "CURSOR_MOVED":
            return DefaultLocationBasedResult
        default:
            return state
    }
}

export const definitionResultReducer: Reducer<DefinitionResult> = (
    state: DefinitionResult = DefaultLocationBasedResult,
    action: LanguageAction,
) => {
    switch(action.type) {
        case "DEFINITION_QUERY_RESULT":
            return action.result
        case "CURSOR_MOVED":
            return DefaultLocationBasedResult
        default:
            return state
    }
}

export const languageStateReducer = combineReducers<ILanguageState>({
    mode: modeReducer,
    activeBuffer: activeBufferReducer,
    cursor: cursorMovedReducer,
    definitionResult: definitionResultReducer,
    hoverResult: hoverResultReducer,
})

export const createStore = (hoverDelay: number, definitionRequestor: IDefinitionRequestor, /*hoverRequestor: IHoverRequestor*/): Store<ILanguageState> => {


    const epicMiddleware = createEpicMiddleware(combineEpics(
        queryForDefinitionAndHoverEpic(hoverDelay),
        queryDefinitionEpic(definitionRequestor),
        // queryHoverEpic(hoverRequestor),
    ))

    return oniCreateStore<ILanguageState>("LANGUAGE", languageStateReducer, DefaultLanguageState, [epicMiddleware])
}

export const queryForDefinitionAndHoverEpic = (hoverDelay: number): Epic<LanguageAction, ILanguageState> => (action$, store) => 
    action$.ofType("CURSOR_MOVED")
        .filter(() => store.getState().mode === "normal")
        .debounceTime(hoverDelay)
        .filter(() => store.getState().mode === "normal")
        .mergeMap((action: LanguageAction) => {

            const currentState = store.getState()
            const filePath = currentState.activeBuffer.filePath
            const language = currentState.activeBuffer.language
            const line =  currentState.cursor.line
            const column =  currentState.cursor.column

            const location = {
                filePath,
                language,
                line,
                column
            }

            const hoverObservable = Observable.of({
                type: "HOVER_QUERY",
                location,
            } as LanguageAction)

            const queryObservable = Observable.of({
                type: "DEFINITION_QUERY",
                location
            } as LanguageAction)

            return Observable.merge(hoverObservable, queryObservable)
        })

export const NullAction = { type: null } as LanguageAction

export interface IHoverRequestor {
    getHover(fileLanguage: string, filePath: string, line: number, column: number): Promise<types.Hover>
}

// TODO: Consolidate / refactor these into higher-order functions
export const queryDefinitionEpic = (definitionRequestor: IDefinitionRequestor): Epic<LanguageAction, ILanguageState> => (action$, store) =>
    action$.ofType("DEFINITION_QUERY")
        .switchMap(() => {

            const state = store.getState()

            const { filePath, language } = state.activeBuffer
            const { line, column } = state.cursor

            return Observable.defer(async () => {

                const result = await definitionRequestor.getDefinition(language, filePath, line, column)
                return {
                    type: "DEFINITION_QUERY_RESULT",
                    result: {
                        filePath,
                        language,
                        line,
                        column,
                        result,
                    }
                } as LanguageAction
            })
        })

export const queryHoverEpic = (hoverRequestor: IHoverRequestor): Epic<LanguageAction, ILanguageState> => (action$, store) =>
    action$.ofType("HOVER_QUERY")
        .switchMap(() => {
            const state = store.getState()

            const { filePath, language } = state.activeBuffer
            const { line, column } = state.cursor

            return Observable.defer(async () => {

                const result = await hoverRequestor.getHover(language, filePath, line, column)
                return {
                    type: "HOVER_QUERY_RESULT",
                    result: {
                        filePath,
                        language,
                        line,
                        column,
                        result,
                    }
                } as LanguageAction
            })
        })

// const getCompletionMeetEpic: Epic<CompletionAction, ICompletionState> = (action$, store) =>
//     action$.ofType("CURSOR_MOVED", "MODE_CHANGED")
//         .map((action: CompletionAction) => {
//             const currentState: ICompletionState = store.getState()

//             if (!currentState.enabled) {
//                 return nullAction
//             }

//             if (!currentState.bufferInfo || !currentState.bufferInfo.language) {
//                 return nullAction
//             }

//             if (!currentState.cursorInfo || !currentState.cursorInfo.lineContents) {
//                 return nullAction
//             }

//             const { bufferInfo } = currentState

//             const token = languageManager.getTokenRegex(bufferInfo.language)
//             const completionCharacters = languageManager.getCompletionTriggerCharacters(bufferInfo.language)

//             const meet = CompletionUtility.getCompletionMeet(currentState.cursorInfo.lineContents, currentState.cursorInfo.column, token, completionCharacters)

//             const meetForAction: ICompletionMeetInfo = {
//                 meetPosition: meet.position,
//                 meetLine: currentState.cursorInfo.line,
//                 queryPosition: meet.positionToQuery,
//                 meetBase: meet.base,
//                 shouldExpand: meet.shouldExpandCompletions,
//             }

//             return {
//                 type: "MEET_CHANGED",
//                 currentMeet: meetForAction,
//             } as CompletionAction
//         })
