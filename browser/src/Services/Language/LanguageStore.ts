/**
 * LanguageStore.ts
 *
 * Manages state for UI-facing elements, like
 * hover & definition
 */

import "rxjs/add/observable/of"
import { Observable } from "rxjs/Observable"

import * as types from "vscode-languageserver-types"

import { combineReducers, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import { createStore as oniCreateStore } from "./../../Redux"

import { Configuration } from "./../Configuration"

import { ICodeActionRequestor, ICodeActionResult } from "./CodeActionsRequestor"
import { IDefinitionRequestor, IDefinitionResult } from "./DefinitionRequestor"
import { IHoverRequestor, IHoverResult } from "./HoverRequestor"

export interface ILocation {
    filePath: string
    language: string
    line: number
    column: number
}

export interface ISelection {
    filePath: string
    language: string
    range: types.Range
}

export interface ILocationBasedResult<T> extends ILocation {
    result: T | null
}

export interface ISelectionBasedResult<T> extends ISelection {
    result: T | null
}

export const DefaultLocationBasedResult: ILocationBasedResult<any> = {
    filePath: null,
    language: null,
    line: -1,
    column: -1,
    result: null,
}

export const DefaultSelectionBasedResult: ISelectionBasedResult<any> = {
    filePath: null,
    language: null,
    range: null,
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

export type CodeActionResult = ISelectionBasedResult<ICodeActionResult>
export type DefinitionResult = ILocationBasedResult<IDefinitionResult>
export type HoverResult = ILocationBasedResult<IHoverResult>

export interface ILanguageState {
    mode: string
    activeBuffer: IActiveBufferState
    cursor: ICursorPositionState
    codeActionResult: CodeActionResult
    hoverResult: HoverResult
    definitionResult: DefinitionResult
    selection: types.Range
}

export const DefaultSelection = types.Range.create(-1, -1, -1, -1)

export const DefaultLanguageState: ILanguageState = {
    mode: "",
    activeBuffer: DefaultActiveBuffer,
    cursor: DefaultCursorPosition,
    codeActionResult: DefaultSelectionBasedResult,
    hoverResult: DefaultLocationBasedResult,
    definitionResult: DefaultLocationBasedResult,
    selection: DefaultSelection,
}

export type LanguageAction = {
    type: "MODE_CHANGED",
    mode: string,
} | {
        type: "CURSOR_MOVED",
        line: number,
        column: number,
    } | {
        type: "SELECTION_CHANGED",
        range: types.Range,
    } | {
        type: "BUFFER_ENTER",
        filePath: string,
        language: string,
    } | {
        type: "HOVER_QUERY",
        location: ILocation,
    } | {
        type: "DEFINITION_QUERY",
        location: ILocation,
    } | {
        type: "HOVER_QUERY_RESULT",
        result: ILocationBasedResult<IHoverResult>,
    } | {
        type: "DEFINITION_QUERY_RESULT",
        result: ILocationBasedResult<IDefinitionResult>,
    } | {
        type: "CODE_ACTION_QUERY",
        selection: ISelection,
    } | {
        type: "CODE_ACTION_QUERY_RESULT",
        result: ISelectionBasedResult<ICodeActionResult>,
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
    action: LanguageAction,
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
    action: LanguageAction,
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
    switch (action.type) {
        case "HOVER_QUERY_RESULT":
            return action.result
        case "CURSOR_MOVED":
        case "BUFFER_ENTER":
        case "MODE_CHANGED":
            return DefaultLocationBasedResult
        default:
            return state
    }
}

export const definitionResultReducer: Reducer<DefinitionResult> = (
    state: DefinitionResult = DefaultLocationBasedResult,
    action: LanguageAction,
) => {
    switch (action.type) {
        case "DEFINITION_QUERY_RESULT":
            return action.result
        case "CURSOR_MOVED":
        case "BUFFER_ENTER":
        case "MODE_CHANGED":
            return DefaultLocationBasedResult
        default:
            return state
    }
}

export const codeActionResultReducer: Reducer<CodeActionResult> = (
    state: CodeActionResult = DefaultSelectionBasedResult,
    action: LanguageAction,
) => {
    switch (action.type) {
        case "CODE_ACTION_QUERY_RESULT":
            return action.result
        case "SELECTION_CHANGED":
        case "CURSOR_MOVED":
        case "BUFFER_ENTER":
        case "MODE_CHANGED":
            return DefaultSelectionBasedResult
        default:
            return state
    }
}

export const selectionReducer: Reducer<types.Range> = (
    state: types.Range = DefaultSelection,
    action: LanguageAction,
) => {
    switch (action.type) {
        case "SELECTION_CHANGED":
            return action.range
        case "CURSOR_MOVED":
        case "BUFFER_ENTER":
        case "MODE_CHANGED":
            return DefaultSelection
        default:
            return state
    }
}

export const languageStateReducer = combineReducers<ILanguageState>({
    mode: modeReducer,
    activeBuffer: activeBufferReducer,
    codeActionResult: codeActionResultReducer,
    cursor: cursorMovedReducer,
    definitionResult: definitionResultReducer,
    hoverResult: hoverResultReducer,
    selection: selectionReducer,
})

export const createStore = (configuration: Configuration, codeActionsRequestor: ICodeActionRequestor, hoverRequestor: IHoverRequestor, definitionRequestor: IDefinitionRequestor): Store<ILanguageState> => {

    const epicMiddleware = createEpicMiddleware(combineEpics(
        queryForDefinitionAndHoverEpic(configuration),
        queryForCodeActionsEpic,
        queryCodeActionsEpic(codeActionsRequestor),
        queryDefinitionEpic(definitionRequestor),
        queryHoverEpic(hoverRequestor),
    ))

    return oniCreateStore<ILanguageState>("LANGUAGE", languageStateReducer, DefaultLanguageState, [epicMiddleware])
}

export const queryForCodeActionsEpic: Epic<LanguageAction, ILanguageState> = (action$, store) =>
    action$.ofType("SELECTION_CHANGED")
        .map((action: LanguageAction) => {

            if (action.type !== "SELECTION_CHANGED") {
                return NullAction
            }
            
            const currentState = store.getState()
            const filePath = currentState.activeBuffer.filePath
            const language = currentState.activeBuffer.language

            const range = action.range

            const selection = {
                filePath,
                language,
                range,
            }

            return {
                type: "CODE_ACTION_QUERY",
                selection,
            } as LanguageAction
        })

export const queryForDefinitionAndHoverEpic = (configuration: Configuration): Epic<LanguageAction, ILanguageState> => (action$, store) =>
    action$.ofType("CURSOR_MOVED")
        .filter(() => store.getState().mode === "normal" && configuration.getValue("editor.quickInfo.enabled"))
        .debounceTime(configuration.getValue("editor.quickInfo.delay"))
        .filter(() => store.getState().mode === "normal")
        .mergeMap((action: LanguageAction) => {

            const currentState = store.getState()
            const filePath = currentState.activeBuffer.filePath
            const language = currentState.activeBuffer.language
            const line = currentState.cursor.line
            const column = currentState.cursor.column

            const location = {
                filePath,
                language,
                line,
                column,
            }

            const hoverObservable = Observable.of({
                type: "HOVER_QUERY",
                location,
            } as LanguageAction)

            const queryObservable = Observable.of({
                type: "DEFINITION_QUERY",
                location,
            } as LanguageAction)

            return Observable.merge(hoverObservable, queryObservable)
        })

export const NullAction = { type: null } as LanguageAction

export const doesLocationBasedResultMatchCursorPosition = (result: ILocationBasedResult<any>, state: ILanguageState) => {
    return result.filePath === state.activeBuffer.filePath
    && result.line === state.cursor.line
    && result.column === state.cursor.column
    && state.mode === "normal"
}

export const queryCodeActionsEpic = (codeActionRequestor: ICodeActionRequestor): Epic<LanguageAction, ILanguageState> => (action$, store) =>
    action$.ofType("CODE_ACTION_QUERY")
        .switchMap(() => {

            const state = store.getState()

            const { filePath, language } = state.activeBuffer

            const range = state.selection

            if (range === DefaultSelection) {
                return Observable.of(NullAction)
            }

            return Observable.defer(async () => {
                const result = await codeActionRequestor.getCodeActions(language, filePath, range, [])
                return {
                    type: "CODE_ACTION_QUERY_RESULT",
                    result: {
                        filePath,
                        language,
                        range,
                        result,
                    }
                } as LanguageAction
            })
        }).filter((action) => {
            if (action.type !== "CODE_ACTION_QUERY_RESULT") {
                return false
            }

            return true
        })

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
                    },
                } as LanguageAction
            })
        })
        .filter((action) => {
            if (action.type !== "DEFINITION_QUERY_RESULT") {
                return false
            }

            return doesLocationBasedResultMatchCursorPosition(action.result, store.getState())
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
                    },
                } as LanguageAction
            })
        })
        .filter((action) => {
            if (action.type !== "HOVER_QUERY_RESULT") {
                return false
            }

            return doesLocationBasedResultMatchCursorPosition(action.result, store.getState())
        })
