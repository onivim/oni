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
    sneaks: IAugmentedSneakInfo[]
}

const DefaultSneakState: ISneakState = {
    isActive: true,
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
            if (!state.isActive) {
                return state
            }

            const newSneaks: IAugmentedSneakInfo[] = action.sneaks.map((sneak, idx) => {
                return {
                    ...sneak,
                    triggerKeys: getLabelFromIndex(idx + state.sneaks.length),
                }
            })

            return {
                ...state,
                sneaks: [...state.sneaks, ...newSneaks],
            }
        default:
            return state
    }
}

export const getLabelFromIndex = (index: number): string => {
    const firstDigit = Math.floor(index / 26)
    const secondDigit = index - firstDigit * 26
    return String.fromCharCode(97 + firstDigit, 97 + secondDigit).toUpperCase()
}

export const createStore = (): Store<ISneakState> => {
    return createReduxStore("Sneaks", sneakReducer, DefaultSneakState)
}
