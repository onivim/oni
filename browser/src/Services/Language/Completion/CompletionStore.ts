/**
 * CompletionStore.ts
 */

import * as types from "vscode-languageserver-types"

import { Observable } from "rxjs/Observable"
import "rxjs/add/operator/mergeMap"

import { applyMiddleware, combineReducers, createStore as reduxCreateStore, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import * as CompletionUtility from "./CompletionUtility"
import { languageManager } from "./../LanguageManager"

import { getCompletions } from "./Completion"

export interface ICompletionMeetInfo {
    meetLine: number
    meetPosition: number
    queryPosition: number
    meetBase: string
    shouldExpand: boolean
}

const DefaultMeetInfo: ICompletionMeetInfo = {
    meetLine: -1,
    meetPosition: -1,
    queryPosition: -1,
    meetBase: "",
    shouldExpand: false,
}

export interface ICompletionBufferInfo {
    language: string
    filePath: string
}

export interface ICompletionResults {
    completions: types.CompletionItem[]
    meetLine: number
    meetPosition: number
}

const DefaultCompletionResults: ICompletionResults = {
    completions: [],
    meetLine: -1,
    meetPosition: -1,
}

export interface ICursorInfo {
    line: number
    column: number
    lineContents: string
}

const DefaultCursorInfo: ICursorInfo = {
    line: -1,
    column: -1,
    lineContents: "",
}

export interface ICompletionState {
    enabled: boolean
    cursorInfo: ICursorInfo
    bufferInfo: ICompletionBufferInfo
    meetInfo: ICompletionMeetInfo
    completionResults: ICompletionResults
}

export type CompletionAction = {
    type: "CURSOR_MOVED",
    line: number,
    column: number
    lineContents: string
} | {
    type: "MODE_CHANGED",
    mode: string
} | {
    type: "BUFFER_ENTER",
    language: string
    filePath: string,
} | {
    type: "COMMIT_COMPLETION"
} | {
    type: "MEET_CHANGED",
    currentMeet: ICompletionMeetInfo
} | {
    type: "GET_COMPLETIONS_RESULT"
    meetLine: number
    meetPosition: number
    completions: types.CompletionItem[]
} | {
    type: "SELECT_ITEM",
    completionItem: types.CompletionItem
} | {
    type: "GET_COMPLETION_ITEM_DETAILS_RESULT"
    completionItemWithDetails: types.CompletionItem
}

const bufferInfoReducer: Reducer<ICompletionBufferInfo> = (
    state: ICompletionBufferInfo = {
        language: null,
        filePath: null
    }, action: CompletionAction
) => {
    switch (action.type) {
        case "BUFFER_ENTER":
            return {
                language: action.language,
                filePath: action.filePath,
            }
        default:
            return state
    }
}

const meetInfoReducer: Reducer<ICompletionMeetInfo> = (
    state: ICompletionMeetInfo = DefaultMeetInfo,
    action: CompletionAction
) => {
    switch (action.type) {
        case "MEET_CHANGED":
            return {
                ...action.currentMeet,
            }
        default:
            return state
    }
}

export const completionResultsReducer: Reducer<ICompletionResults> = (
    state: ICompletionResults = DefaultCompletionResults,
    action: CompletionAction
) => {
    switch (action.type) {
        case "MODE_CHANGED":
        case "BUFFER_ENTER":
            return DefaultCompletionResults
        case "GET_COMPLETIONS_RESULT":
            return {
                meetLine: action.meetLine,
                meetPosition: action.meetPosition,
                completions: action.completions,
            }
        default:
            return state
    }
}

export const cursorInfoReducer: Reducer<ICursorInfo> = (
    state: ICursorInfo = DefaultCursorInfo,
    action: CompletionAction
) => {
    return state
}

export const enabledReducer: Reducer<boolean> = (
    state: boolean = false,
    action: CompletionAction
) => {
    switch(action.type) {
        case "MODE_CHANGED":
            return action.mode === "insert"
        default:
            return state
    }
}

const nullAction = { type: null } as CompletionAction

const getCompletionMeetEpic: Epic<CompletionAction, ICompletionState> = (action$, store) =>
    action$.ofType("CURSOR_MOVED")
        .map((action: CompletionAction) => {
            const currentState: ICompletionState = store.getState()

            if (action.type !== "CURSOR_MOVED") {
                return nullAction
            }

            if (!currentState.enabled) {
                return nullAction
            }

            if (!currentState.bufferInfo || !currentState.bufferInfo.language) {
                return nullAction
            }

            const {bufferInfo }= currentState

            const token = languageManager.getTokenRegex(bufferInfo.language)
            const completionCharacters = languageManager.getCompletionTriggerCharacters(bufferInfo.language)

            const meet = CompletionUtility.getCompletionMeet(action.lineContents, action.column, token, completionCharacters)

            const meetForAction: ICompletionMeetInfo = {
                meetPosition: meet.position,
                meetLine: action.line,
                queryPosition: meet.positionToQuery,
                meetBase: meet.base,
                shouldExpand: meet.shouldExpandCompletions
            }

            console.log("DISPATCHING MEET_CHANGED")

            return {
                type: "MEET_CHANGED",
                currentMeet: meetForAction
            } as CompletionAction
        })

const getCompletionsEpic: Epic<CompletionAction, ICompletionState> = (action$, store) => 
    action$.ofType("MEET_CHANGED")
        .filter(() => store.getState().enabled)
        .filter((action) => {
            const state = store.getState()

            if (action.type !== "MEET_CHANGED") {
                return false
            }

            if (!action.currentMeet.shouldExpand) {
                return false
            }

            if (action.currentMeet.meetLine === state.completionResults.meetLine
                && action.currentMeet.meetPosition === state.completionResults.meetPosition) {
                    return false
            }

            return true
        })
        .mergeMap((action: CompletionAction): Observable<CompletionAction> => {

            const state = store.getState()

            // Helper to let TypeScript know that we can assume this is 'MEET_CHANGED'...
            if (action.type !== "MEET_CHANGED") {
                return Observable.of(nullAction)
            }

            // Check if the meet is different from the last meet we queried
            const requestResult: Observable<types.CompletionItem[]> = Observable.defer(async () => {
                const results = await getCompletions(state.bufferInfo.language, state.bufferInfo.filePath, action.currentMeet.meetLine, action.currentMeet.queryPosition)
                const completions = results || []
                return completions

            })

            const ret = requestResult.map((completions) => {
                console.log("Got completions: " + completions.length)
                return {
                    type: "GET_COMPLETIONS_RESULT",
                    meetLine: action.currentMeet.meetLine,
                    meetPosition: action.currentMeet.meetPosition,
                    completions,
                } as CompletionAction
            })

            return ret
        })

export const createStore = (): Store<ICompletionState> => {
    return reduxCreateStore(
        combineReducers<ICompletionState>({
            enabled: enabledReducer,
            bufferInfo: bufferInfoReducer,
            meetInfo: meetInfoReducer,
            completionResults: completionResultsReducer,
        }),
        applyMiddleware(createEpicMiddleware(combineEpics(
            getCompletionMeetEpic,
            getCompletionsEpic,
        ))))
}
