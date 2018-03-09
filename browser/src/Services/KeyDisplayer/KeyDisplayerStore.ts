/**
 * KeyDisplayerStore
 *
 * State management for the KeyDisplayer
 */

import { Reducer, Store } from "redux"
import { createStore as createReduxStore } from "./../../Redux"

import { createEpicMiddleware, Epic } from "redux-observable"
import "rxjs/add/operator/delay"

export interface IKeyPressInfo {
    timeInMilliseconds: number
    key: string
}

const EmptyArray: IKeyPressInfo[] = []

// This is the total 'size'. For example, if this value is 1000,
// we will show all key presses over the last 1000ms (1s)
export const WindowToShowInMilliseconds = 1000

// This is the size to 'group' key presses - any keys pressed
// within this timeframe will be grouped together in a box,
// instead of having their own box
export const WindowToGroupInMilliseconds = 250

// Keys coming quicker than the 'DupWindow' will be removed
// This is somewhat of a hack, as there is a bug in the input
// resolver pipeline where they can be called multiple times
export const DupWindow = 5

export interface KeyDisplayerState {
    keys: IKeyPressInfo[]
    currentTime: number
}

const DefaultKeyDisplayerState: KeyDisplayerState = {
    keys: EmptyArray,
    currentTime: -1,
}

export type KeyDisplayerAction =
    | {
          type: "ADD_KEY"
          key: string
          timeInMilliseconds: number
      }
    | {
          type: "UPDATE_TIME"
          time: number
      }
    | { type: "RESET" }

export const reducer: Reducer<KeyDisplayerState> = (
    state: KeyDisplayerState = DefaultKeyDisplayerState,
    action: KeyDisplayerAction,
) => {
    switch (action.type) {
        case "ADD_KEY":
            return {
                ...state,
                keys: [
                    ...state.keys,
                    { key: action.key, timeInMilliseconds: action.timeInMilliseconds },
                ],
            }
        case "UPDATE_TIME":
            return {
                ...state,
                currentTime: action.time,
                keys: state.keys.filter(
                    key => key.timeInMilliseconds > action.time - WindowToShowInMilliseconds,
                ),
            }
        case "RESET":
            return DefaultKeyDisplayerState
        default:
            return state
    }
}

export const getGroupedKeys = (currentTime: number, keys: IKeyPressInfo[]): IKeyPressInfo[][] => {
    const activeKeys = keys.sort((a, b) => a.timeInMilliseconds - b.timeInMilliseconds)

    const coalescedKeys = activeKeys.reduce<IKeyPressInfo[][]>(
        (prev: IKeyPressInfo[][], cur) => {
            const lastGroup = prev[prev.length - 1]
            if (lastGroup.length === 0) {
                return [...prev, [cur]]
            } else {
                const lastItemInLastGroup = lastGroup[lastGroup.length - 1]
                const diffTime = Math.abs(
                    lastItemInLastGroup.timeInMilliseconds - cur.timeInMilliseconds,
                )

                if (diffTime < WindowToGroupInMilliseconds) {
                    // Avoid duplicates..
                    if (diffTime < DupWindow && lastItemInLastGroup.key === cur.key) {
                        return prev
                    }

                    lastGroup.push(cur)
                    return prev
                } else {
                    return [...prev, [cur]]
                }
            }
        },
        [[]],
    )

    const sanitizedKeys = coalescedKeys.filter(group => group.length > 0)

    return sanitizedKeys
}

const clearKeysAfterDelayEpic: Epic<KeyDisplayerAction, KeyDisplayerState> = (action$, store) =>
    action$
        .ofType("ADD_KEY")
        .delay(WindowToShowInMilliseconds + DupWindow)
        .map(action => {
            return {
                type: "UPDATE_TIME",
                time: new Date().getTime(),
            } as KeyDisplayerAction
        })

export const createStore = (): Store<KeyDisplayerState> => {
    return createReduxStore("KeyDisplayer", reducer, DefaultKeyDisplayerState, [
        createEpicMiddleware(clearKeysAfterDelayEpic),
    ])
}
