/**
 * SidebarStore.ts
 *
 * State management for the sidebar split
 */

import { Reducer, Store } from "redux"
import { createStore as createReduxStore } from "./../../Redux"

import { Configuration } from "../Configuration"
import { DefaultConfiguration } from "../Configuration/DefaultConfiguration"
import { WindowManager, WindowSplitHandle } from "./../WindowManager"
import { SidebarContentSplit } from "./SidebarContentSplit"
import { SidebarSplit } from "./SidebarSplit"

import * as Oni from "oni-api"

export interface ISidebarState {
    entries: ISidebarEntry[]

    // Active means that the tab is currently selected
    activeEntryId: string

    isActive: boolean

    width: string
}

export type SidebarIcon = string

export interface ISidebarEntry {
    // TODO: Remove this, duplicated between here and `SidebarPane`
    id: string
    icon: SidebarIcon
    pane: SidebarPane
    hasNotification?: boolean
}

export interface SidebarPane extends Oni.IWindowSplit {
    id: string
    title: string

    enter(): void
    leave(): void
}

export class SidebarManager {
    private _store: Store<ISidebarState>

    private _iconSplit: WindowSplitHandle
    private _contentSplit: WindowSplitHandle

    public get activeEntryId(): string {
        return this._store.getState().activeEntryId
    }

    public get entries(): ISidebarEntry[] {
        return this._store.getState().entries
    }

    get isFocused(): boolean {
        return this._contentSplit.isFocused
    }

    public get store(): Store<ISidebarState> {
        return this._store
    }

    constructor(
        private _windowManager: WindowManager = null,
        private _configuration: Configuration,
    ) {
        this._store = createStore()

        this._configuration.onConfigurationChanged.subscribe(val => {
            if (typeof val["sidebar.width"] === "string") {
                this.setWidth(val["sidebar.width"])
            }
        })

        this.setWidth(this._configuration.getValue("sidebar.width"))

        if (_windowManager) {
            this._iconSplit = this._windowManager.createSplit("left", new SidebarSplit(this))
            this._contentSplit = this._windowManager.createSplit(
                "left",
                new SidebarContentSplit(this),
            )
        }
    }

    public increaseWidth(): void {
        this.store.dispatch({ type: "INCREASE_WIDTH" })
    }

    public decreaseWidth(): void {
        this.store.dispatch({ type: "DECREASE_WIDTH" })
    }

    public setWidth(width: string): void {
        if (width) {
            this._store.dispatch({
                type: "SET_WIDTH",
                width,
            })
        }
    }

    public setNotification(id: string): void {
        if (id) {
            this._store.dispatch({
                type: "SET_NOTIFICATION",
                id,
            })
        }
    }

    public setActiveEntry(id: string): void {
        if (id) {
            this._store.dispatch({
                type: "SET_ACTIVE_ID",
                activeEntryId: id,
            })

            if (!this._contentSplit.isVisible) {
                this._contentSplit.show()
            }
        }
    }

    public focusContents(): void {
        if (this._contentSplit.isVisible) {
            this._contentSplit.focus()
        }
    }

    public toggleSidebarVisibility(): void {
        if (this._contentSplit.isVisible) {
            this._contentSplit.hide()

            if (this._contentSplit.isFocused) {
                this._iconSplit.focus()
            }
        } else {
            this._contentSplit.show()
        }
    }

    public enter(): void {
        this._store.dispatch({ type: "ENTER" })
    }

    public leave(): void {
        this._store.dispatch({ type: "LEAVE" })
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
    isActive: false,
    width: null,
}

export type SidebarActions =
    | {
          type: "SET_ACTIVE_ID"
          activeEntryId: string
      }
    | {
          type: "ADD_ENTRY"
          entry: ISidebarEntry
      }
    | {
          type: "SET_NOTIFICATION"
          id: string
      }
    | {
          type: "SET_WIDTH"
          width: string
      }
    | {
          type: "ENTER"
      }
    | {
          type: "LEAVE"
      }
    | {
          type: "INCREASE_WIDTH"
      }
    | {
          type: "DECREASE_WIDTH"
      }

export const changeSize = (change: "increase" | "decrease") => (
    size: string,
    defaultValue = DefaultConfiguration["sidebar.width"],
): string => {
    const [numberString, letters = "em"] = size.match(/[a-zA-Z]+|[0-9]+/g)
    const isAllowedUnit = ["em", "px", "vw"].includes(letters)
    const unitsToUse = isAllowedUnit ? letters : "em"
    const convertedNumber = Number(numberString)
    if (isNaN(convertedNumber) || convertedNumber <= 1) {
        return defaultValue
    }
    const changed = change === "increase" ? convertedNumber + 1 : convertedNumber - 1

    return `${changed}${unitsToUse}`
}

export const increaseWidth = changeSize("increase")
export const decreaseWidth = changeSize("decrease")

export const sidebarReducer: Reducer<ISidebarState> = (
    state: ISidebarState = DefaultSidebarState,
    action: SidebarActions,
) => {
    const newState = {
        ...state,
        entries: entriesReducer(state.entries, action),
    }

    switch (action.type) {
        case "ENTER":
            return {
                ...newState,
                isActive: true,
            }
        case "LEAVE":
            return {
                ...newState,
                isActive: false,
            }
        case "SET_WIDTH":
            return {
                ...newState,
                width: action.width,
            }
        case "SET_ACTIVE_ID":
            return {
                ...newState,
                activeEntryId: action.activeEntryId,
            }
        case "ADD_ENTRY":
            if (!state.activeEntryId) {
                return {
                    ...newState,
                    activeEntryId: action.entry.pane.id,
                }
            } else {
                return newState
            }
        case "DECREASE_WIDTH":
            return {
                ...newState,
                width: decreaseWidth(newState.width),
            }
        case "INCREASE_WIDTH":
            return {
                ...newState,
                width: increaseWidth(newState.width),
            }
        default:
            return newState
    }
}

export const entriesReducer: Reducer<ISidebarEntry[]> = (
    state: ISidebarEntry[] = [],
    action: SidebarActions,
) => {
    switch (action.type) {
        case "ADD_ENTRY":
            return [...state, action.entry]
        case "SET_ACTIVE_ID":
            return state.map(e => {
                if (e.id === action.activeEntryId) {
                    return {
                        ...e,
                        hasNotification: false,
                    }
                } else {
                    return e
                }
            })
        case "SET_NOTIFICATION":
            return state.map(e => {
                if (e.id !== action.id) {
                    return e
                } else {
                    return {
                        ...e,
                        hasNotification: true,
                    }
                }
            })
        default:
            return state
    }
}

export const createStore = (): Store<ISidebarState> => {
    return createReduxStore("Sidebar", sidebarReducer, DefaultSidebarState)
}
