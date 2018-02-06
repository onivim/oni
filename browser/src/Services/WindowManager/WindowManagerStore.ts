/**
 * WindowManagerStore.ts
 *
 * Redux store for managing window state
 */

import * as Oni from "oni-api"

import { Store, Reducer } from "redux"
import { createStore as createReduxStore } from "./../../Redux"

import { Direction, ISplitInfo, SplitDirection } from "./index"

export interface IAugmentedSplitInfo extends Oni.IWindowSplit {
    // Potential API methods
    enter?(): void
    leave?(): void

    // Internal bookkeeping
    id: string
}

export type SplitOrLeaf<T> = ISplitInfo<T> | ISplitLeaf<T>

export interface ISplitInfo<T> {
    type: "Split"
    splits: Array<SplitOrLeaf<T>>
    direction: SplitDirection
}

export interface ISplitLeaf<T> {
    type: "Leaf"
    contents: T
}

type WindowActions =
    | {
          type: "SET_DOCK_SPLITS"
          dock: Direction
          splits: IAugmentedSplitInfo[]
      }
    | {
          type: "SET_PRIMARY_SPLITS"
          splits: ISplitInfo<IAugmentedSplitInfo>
      }
    | {
          type: "SET_FOCUSED_SPLIT"
          splitId: string
      }
    | {
          type: "SHOW_SPLIT"
          splitId: string
      }
    | {
          type: "HIDE_SPLIT"
          splitId: string
      }

export type DockWindows = { [key: string]: IAugmentedSplitInfo[] }

export interface WindowState {
    docks: DockWindows

    primarySplit: ISplitInfo<IAugmentedSplitInfo>

    focusedSplitId: string
    hiddenSplits: string[]
}

export const DefaultWindowState: WindowState = {
    docks: {
        left: [],
        right: [],
        up: [],
        down: [],
    },
    primarySplit: null,
    focusedSplitId: null,
    hiddenSplits: [],
}

export const reducer: Reducer<WindowState> = (
    state: WindowState = DefaultWindowState,
    action: WindowActions,
) => {
    switch (action.type) {
        case "SET_PRIMARY_SPLITS":
            return {
                ...state,
                primarySplit: action.splits,
            }
        default:
            return state
    }
}

export const createStore = (): Store<WindowState> => {
    return createReduxStore("WindowManager", reducer, DefaultWindowState, [])
}
