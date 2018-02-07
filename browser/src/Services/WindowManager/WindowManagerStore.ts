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
          type: "ADD_DOCK_SPLIT"
          dock: Direction
          split: IAugmentedSplitInfo
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

export const DefaultDocksState: DockWindows = {
    left: [],
    right: [],
    up: [],
    down: [],
}

export interface WindowState {
    docks: DockWindows

    primarySplit: ISplitInfo<IAugmentedSplitInfo>

    focusedSplitId: string
    hiddenSplits: string[]
}

export const DefaultWindowState: WindowState = {
    docks: DefaultDocksState,
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
        case "SET_FOCUSED_SPLIT":
            return {
                ...state,
                focusedSplitId: action.splitId,
            }
        default:
            return {
                ...state,
                docks: docksReducer(state.docks, action),
            }
    }
}

export const docksReducer: Reducer<DockWindows> = (
    state: DockWindows = DefaultDocksState,
    action: WindowActions,
) => {
    switch (action.type) {
        case "ADD_DOCK_SPLIT":
            return {
                ...state,
                [action.dock]: [...state[action.dock], action.split],
            }
        default:
            return state
    }
}

export const createStore = (): Store<WindowState> => {
    return createReduxStore("WindowManager", reducer, DefaultWindowState, [])
}
