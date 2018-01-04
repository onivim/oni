/**
 * SidebarStore.ts
 *
 * State management for the sidebar split
 */

import { Reducer, Store } from "redux"
import { createStore as createReduxStore } from "./../../Redux"

export interface ISidebarEntry {
    id: string
    icon: string
    enabled: boolean
}

export interface ISidebarState {
    icons: ISidebarEntry[]

    // Active means that the tab is currently selected
    activeEntryId: string

    // Focused means that there is keyboard focus,
    // like 'hover' but for keyboard accessibility
    focusedEntryId: string
}

const DefaultSidebarState: ISidebarState = {
    icons: [
        { id: "sidebar.explorer", icon: "files-o", enabled: true },
        { id: "sidebar.search", icon: "search", enabled: true },
        { id: "sidebar.tutor", icon: "graduation-cap", enabled: true },
        { id: "sidebar.vcs", icon: "code-fork", enabled: true },
        { id: "sidebar.debugger", icon: "bug", enabled: true },
        { id: "sidebar.packages", icon: "th", enabled: true },
    ],
    activeEntryId: "sidebar.explorer",
    focusedEntryId: null,
}

export type SidebarActions = {
    type: "SET_ACTIVE_ID",
    activeEntryId: string,
} | {
    type: "SET_FOCUSED_ID",
    focusedEntryId: string,
}

export const sidebarReducer: Reducer<ISidebarState> = (
    state: ISidebarState = DefaultSidebarState,
    action: SidebarActions,
) => {
    switch (action.type) {
        case "SET_ACTIVE_ID":
            return {
                ...state,
                activeEntryId: action.activeEntryId,
            }
        case "SET_FOCUSED_ID":
            return {
                ...state,
                focusedEntryId: action.focusedEntryId,
            }
        default:
            return state
    }
}

export const createStore = (): Store<ISidebarState> => {
    return createReduxStore("Sidebar", sidebarReducer, DefaultSidebarState)
}
