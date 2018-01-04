/**
 * SidebarStore.ts
 *
 * State management for the sidebar split
 */

import { Reducer, Store } from "redux"
import { createStore as createReduxStore } from "./../../Redux"

import * as Oni from "oni-api"

export interface ISidebarState {
    entries: ISidebarEntry[]

    // Active means that the tab is currently selected
    activeEntryId: string

    // Focused means that there is keyboard focus,
    // like 'hover' but for keyboard accessibility
    focusedEntryId: string
}

export type SidebarIcon = string

export interface ISidebarEntry {
    // TODO: Remove this, duplicated between here and `SidebarPane`
    id: string
    icon: SidebarIcon
    pane: SidebarPane
}

export interface SidebarPane extends Oni.IWindowSplit {
    id: string
    title: string
}

export class SidebarManager {

    private _store: Store<ISidebarState>

    public get activeEntryId(): string {
        return this._store.getState().activeEntryId
    }

    public get entries(): ISidebarEntry[] {
        return this._store.getState().entries
    }

    public get store(): Store<ISidebarState> {
        return this._store
    }

    constructor() {
        this._store = createStore()
    }

    public setFocusedEntry(id: string): void {
        this._store.dispatch({
            type: "SET_FOCUSED_ID",
            focusedEntryId: id,
        })
    }

    public add(icon: SidebarIcon, pane: SidebarPane): void {
        const entry = {
            id: pane.id,
            icon,
            pane,
        }
        this._store.dispatch({
            type: "ADD_ENTRY",
            entry,
        })
    }
}

const DefaultSidebarState: ISidebarState = {
    entries: [],
    activeEntryId: null,
    focusedEntryId: null,
}

export type SidebarActions = {
    type: "SET_ACTIVE_ID",
    activeEntryId: string,
} | {
    type: "SET_FOCUSED_ID",
    focusedEntryId: string,
} | {
    type: "ADD_ENTRY",
    entry: ISidebarEntry,
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

        case "ADD_ENTRY":
            if (!state.activeEntryId) {
                return {
                    ...state,
                    activeEntryId: action.entry.pane.id,
                    entries: entriesReducer(state.entries, action),
                }
            } else {
                return {
                    ...state,
                    entries: entriesReducer(state.entries, action),
                }
            }
        default:
            return state
    }
}

export const entriesReducer: Reducer<ISidebarEntry[]> = (
    state: ISidebarEntry[] = [],
    action: SidebarActions,
) => {
    switch (action.type) {
        case "ADD_ENTRY":
            return [...state, action.entry]
        default:
            return state
    }
}

export const createStore = (): Store<ISidebarState> => {
    return createReduxStore("Sidebar", sidebarReducer, DefaultSidebarState)
}
