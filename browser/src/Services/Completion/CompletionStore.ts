/**
 * CompletionStore.ts
 */

import * as types from "vscode-languageserver-types"

import "rxjs/add/operator/mergeMap"
import { Observable } from "rxjs/Observable"

import { applyMiddleware, combineReducers, createStore as reduxCreateStore, Reducer, Store } from "redux"
import { combineEpics, createEpicMiddleware, Epic } from "redux-observable"

import { languageManager } from "./../Language"
import * as CompletionSelects from "./CompletionSelectors"
import * as CompletionUtility from "./CompletionUtility"

import { commitCompletion, getCompletions, resolveCompletionItem } from "./Completion"

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

export interface ILastCompletionInfo {
    meetLine: number
    meetPosition: number
    completedText: string
}

const DefaultLastCompletionInfo: ILastCompletionInfo = {
    meetLine: -1,
    meetPosition: -1,
    completedText: "",
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
    lastCompletionInfo: ILastCompletionInfo
}

export type CompletionAction = {
    type: "CURSOR_MOVED",
    line: number,
    column: number
    lineContents: string,
} | {
    type: "MODE_CHANGED",
    mode: string,
} | {
    type: "BUFFER_ENTER",
    language: string
    filePath: string,
} | {
    type: "COMMIT_COMPLETION"
    meetBase: string
    meetLine: number
    meetPosition: number
    completionText: string,
} | {
    type: "MEET_CHANGED",
    currentMeet: ICompletionMeetInfo,
} | {
    type: "GET_COMPLETIONS_RESULT"
    meetLine: number
    meetPosition: number
    completions: types.CompletionItem[],
} | {
    type: "SELECT_ITEM",
    completionItem: types.CompletionItem,
} | {
    type: "GET_COMPLETION_ITEM_DETAILS_RESULT"
    completionItemWithDetails: types.CompletionItem,
}

const bufferInfoReducer: Reducer<ICompletionBufferInfo> = (
    state: ICompletionBufferInfo = {
        language: null,
        filePath: null,
    }, action: CompletionAction,
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
    action: CompletionAction,
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
    action: CompletionAction,
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
        case "GET_COMPLETION_ITEM_DETAILS_RESULT":
            return {
                ...state,
                completions: state.completions.map((completion) => {
                    if (completion.label === action.completionItemWithDetails.label) {
                        return action.completionItemWithDetails
                    } else {
                        return completion
                    }
                }),
        }
        default:
            return state
    }
}

export const cursorInfoReducer: Reducer<ICursorInfo> = (
    state: ICursorInfo = DefaultCursorInfo,
    action: CompletionAction,
) => {
    switch (action.type) {
        case "CURSOR_MOVED":
            return {
            line: action.line,
            lineContents: action.lineContents,
            column: action.column,
        }
        default:
            return state
    }
}

export const enabledReducer: Reducer<boolean> = (
    state: boolean = false,
    action: CompletionAction,
) => {
    switch (action.type) {
        case "MODE_CHANGED":
            return action.mode === "insert"
        default:
            return state
    }
}

export const lastCompletionInfoReducer: Reducer<ILastCompletionInfo> = (
    state: ILastCompletionInfo = DefaultLastCompletionInfo,
    action: CompletionAction,
) => {
    switch (action.type) {
        case "MODE_CHANGED":
        case "BUFFER_ENTER":
            return DefaultLastCompletionInfo
        case "COMMIT_COMPLETION":
            return {
                meetLine: action.meetLine,
                meetPosition: action.meetPosition,
                completedText: action.completionText,
        }
        default:
            return state
    }
}

const nullAction = { type: null } as CompletionAction

const getCompletionMeetEpic: Epic<CompletionAction, ICompletionState> = (action$, store) =>
    action$.ofType("CURSOR_MOVED", "MODE_CHANGED")
        .map((action: CompletionAction) => {
            const currentState: ICompletionState = store.getState()

            if (!currentState.enabled) {
                return nullAction
            }

            if (!currentState.bufferInfo || !currentState.bufferInfo.language) {
                return nullAction
            }

            const {bufferInfo } = currentState

            const token = languageManager.getTokenRegex(bufferInfo.language)
            const completionCharacters = languageManager.getCompletionTriggerCharacters(bufferInfo.language)

            const meet = CompletionUtility.getCompletionMeet(currentState.cursorInfo.lineContents, currentState.cursorInfo.column, token, completionCharacters)

            const meetForAction: ICompletionMeetInfo = {
                meetPosition: meet.position,
                meetLine: currentState.cursorInfo.line,
                queryPosition: meet.positionToQuery,
                meetBase: meet.base,
                shouldExpand: meet.shouldExpandCompletions,
            }

            console.log("DISPATCHING MEET_CHANGED")

            return {
                type: "MEET_CHANGED",
                currentMeet: meetForAction,
            } as CompletionAction
        })

const commitCompletionEpic: Epic<CompletionAction, ICompletionState> = (action$, store) =>
    action$.ofType("COMMIT_COMPLETION")
        .do(async (action) => {
            if (action.type !== "COMMIT_COMPLETION") {
                return
            }

            await commitCompletion(action.meetLine, action.meetPosition, action.completionText)
        }).map(_ => nullAction)

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

const getCompletionDetailsEpic: Epic<CompletionAction, ICompletionState> = (action$, store) =>
    action$.ofType("SELECT_ITEM")
        .mergeMap((action) => {

            if (action.type !== "SELECT_ITEM") {
                return Observable.of(nullAction)
            }

            return Observable.defer(async () => {
                const state = store.getState()

                const result = await resolveCompletionItem(state.bufferInfo.language, state.bufferInfo.filePath, action.completionItem)
                return result
            }).map((itemResult: types.CompletionItem) => {
                if (itemResult) {
                    return {
                        type: "GET_COMPLETION_ITEM_DETAILS_RESULT",
                        completionItemWithDetails: itemResult,
                    } as CompletionAction
                } else {
                    return nullAction
                }
            })
        })

const selectFirstItemEpic: Epic<CompletionAction, ICompletionState> = (action$, store) =>
    action$.ofType("GET_COMPLETIONS_RESULT")
        .map((action) => {

            if (action.type !== "GET_COMPLETIONS_RESULT") {
                return nullAction
            }

            const state = store.getState()
            const filteredItems = CompletionSelects.filterCompletionOptions(action.completions, state.meetInfo.meetBase)

            if (!filteredItems || !filteredItems.length) {
                return nullAction
            }

            return {
                type: "SELECT_ITEM",
                completionItem: filteredItems[0],
            } as CompletionAction

        })

export const createStore = (): Store<ICompletionState> => {
    return reduxCreateStore(
        combineReducers<ICompletionState>({
            enabled: enabledReducer,
            bufferInfo: bufferInfoReducer,
            meetInfo: meetInfoReducer,
            completionResults: completionResultsReducer,
            lastCompletionInfo: lastCompletionInfoReducer,
            cursorInfo: cursorInfoReducer,
        }),
        applyMiddleware(createEpicMiddleware(combineEpics(
            commitCompletionEpic,
            getCompletionMeetEpic,
            getCompletionsEpic,
            getCompletionDetailsEpic,
            selectFirstItemEpic,
        ))))
}
