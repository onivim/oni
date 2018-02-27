/**
 * SneakStore.ts
 *
 * State management for Sneaks
 */

import { Reducer, Store } from "redux"

import { Shapes } from "oni-api"

import { createStore as createReduxStore } from "./../../Redux"

export interface ISneakInfo {
    rectangle: Shapes.Rectangle
    callback: () => void
}

export interface IAugmentedSneakInfo extends ISneakInfo {
    triggerKeys: string
}

export interface ISneakState {
    isActive: boolean
    currentIndex: number
    sneaks: IAugmentedSneakInfo[]
}

const DefaultSneakState: ISneakState = {
    isActive: true,
    currentIndex: 0,
    sneaks: [],
}

export type SneakAction =
    | {
          type: "START"
      }
    | {
          type: "END"
      }
    | {
          type: "ADD_SNEAKS"
          sneaks: ISneakInfo[]
      }

export const sneakReducer: Reducer<ISneakState> = (
    state: ISneakState = DefaultSneakState,
    action: SneakAction,
) => {
    switch (action.type) {
        case "START":
            return DefaultSneakState
        case "END":
            return {
                ...DefaultSneakState,
                isActive: false,
            }
        case "ADD_SNEAKS":
        default:
            return state
    }
}

export const createStore = (): Store<ISneakState> => {
    return createReduxStore("Sneaks", sneakReducer, DefaultSneakState)
}
