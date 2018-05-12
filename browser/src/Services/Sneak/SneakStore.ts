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

    // `tag` is an optional string used to identify the sneak
    tag?: string
}

export interface IAugmentedSneakInfo extends ISneakInfo {
    triggerKeys: string
}

export interface ISneakState {
    isActive: boolean
    sneaks: IAugmentedSneakInfo[]
    width: number
    height: number
}

const DefaultSneakState: ISneakState = {
    isActive: true,
    sneaks: [],
    width: 0,
    height: 0,
}

export type SneakAction =
    | {
          type: "START"
          width: number
          height: number
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
            return {
                ...DefaultSneakState,
                width: action.width,
                height: action.height,
            }
        case "END":
            return {
                ...DefaultSneakState,
                isActive: false,
            }
        case "ADD_SNEAKS":
            if (!state.isActive) {
                return state
            }

            const filteredSneaks = action.sneaks.filter(sneak => {
                const { x, y } = sneak.rectangle
                return x >= 0 && y >= 0 && x < state.width && y < state.height
            })

            const newSneaks: IAugmentedSneakInfo[] = filteredSneaks.map((sneak, idx) => {
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
