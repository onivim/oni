import { Store } from "redux"

import { createStore as createReduxStore } from "./../../Redux"

interface IBrowserState {
    inputInProgress: boolean
}
export type BrowserStore = Store<IBrowserState>

const DefaultBrowserState = {
    inputInProgress: false,
}

interface IAction<T, P = undefined> {
    type: T
    payload: P
}

type IInputInProgressAction = IAction<"INPUT_IN_PROGRESS", boolean>

type IBrowserAction = IInputInProgressAction

export function reducer(state = DefaultBrowserState, action: IBrowserAction) {
    switch (action.type) {
        case "INPUT_IN_PROGRESS":
            return {
                ...state,
                inputInProgress: action.payload,
            }
        default:
            return state
    }
}

export const createStore = (): Store<IBrowserState> => {
    return createReduxStore("Browser", reducer, DefaultBrowserState)
}
