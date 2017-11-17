/**
 * CompletionStore.ts
 */

import * as types from "vscode-languageserver-types"

import { combineReducers, createStore as reduxCreateStore, Reducer, Store } from "redux"

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
    meetLine: -1
    meetPosition: -1,
}

export interface ICompletionState {
    bufferInfo: ICompletionBufferInfo
    meetInfo: ICompletionMeetInfo
    completionResults: ICompletionResults
}

export type CompletionAction = {
    type: "MODE_CHANGED",
    mode: string
} | {
    type: "BUFFER_CHANGED",
    language: string
    filePath: string,
} | {
    type: "CURRENT_MEET_CHANGED",
    currentMeet: ICompletionMeetInfo
} | {
    type: "GET_COMPLETIONS_START"
} | {
    type: "GET_COMPLETIONS_FINISH"
    meetLine: number
    meetPosition: number
    completions: types.CompletionItem[]
} | {
    type: "SELECT_ITEM",
    completionItem: types.CompletionItem
} | {
    type: "GET_COMPLETION_ITEM_DETAILS_START"
    completionItem: types.CompletionItem
} | {
    type: "GET_COMPLETION_ITEM_DETAILS_FINISH"
    completionItemWithDetails: types.CompletionItem
}

const bufferInfoReducer: Reducer<ICompletionBufferInfo> = (
    state: ICompletionBufferInfo = {
        language: null,
        filePath: null
    }, action: CompletionAction
) => {
    return state
}

const meetInfoReducer: Reducer<ICompletionMeetInfo> = (
    state: ICompletionMeetInfo = DefaultMeetInfo,
    action: CompletionAction
) => {
    return state
}

export const completionResultsReducer: Reducer<ICompletionResults> = (
    state: ICompletionResults = DefaultCompletionResults,
    action: CompletionAction
) => {
    return state
}

export const createStore = (): Store<ICompletionState> => {
    return reduxCreateStore(
        combineReducers<ICompletionState>({
            bufferInfo: bufferInfoReducer,
            meetInfo: meetInfoReducer,
            completionResults: completionResultsReducer,
        }))
}
