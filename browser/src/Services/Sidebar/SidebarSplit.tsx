/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { createStore, ISidebarState } from "./SidebarStore"
import { Sidebar } from "./SidebarView"

export type SidebarIcon = string

export interface ISidebarEntry {
    icon: SidebarIcon
    pane: SidebarPane
}

export interface SidebarPane extends Oni.IWindowSplit {
    id: string
}

export class SidebarManager {

    private _onSidebarChanged = new Event<void>()
    private _sidebarEntries: ISidebarEntry[] = []

    public get onSidebarChanged(): IEvent<void> {
        return this._onSidebarChanged
    }

    public sidebarEntries(): ISidebarEntry[] {
        return this._sidebarEntries
    }

    public add(icon: SidebarIcon, pane: SidebarPane): void {
        this._sidebarEntries = [...this._sidebarEntries, {
            icon,
            pane,
        }]

        this._onSidebarChanged.dispatch()
    }
}

export class SidebarSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    private _activeBinding: IMenuBinding = null
    private _store: Store<ISidebarState>

    constructor(
        // private _sidebarManager: SidebarManager,
    ) {
        this._store = createStore()

        // this._sidebarManager.onSidebarChanged.subscribe(() => {
        //     console.log("changed")
        // })
    }

    public enter(): void {
        this._onEnterEvent.dispatch()

        const state = this._store.getState()
        this._store.dispatch({
            type: "SET_FOCUSED_ID",
            focusedEntryId: state.activeEntryId,
        })

        this._activeBinding = getInstance().bindToMenu()
        this._activeBinding.setItems(state.icons.map((i) => i.id), state.activeEntryId)

        this._activeBinding.onCursorMoved.subscribe((id: string) => {
            this._store.dispatch({
                type: "SET_FOCUSED_ID",
                focusedEntryId: id,
            })
        })
    }

    public leave(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }

        this._store.dispatch({
            type: "SET_FOCUSED_ID",
            focusedEntryId: null,
        })
    }

    public render(): JSX.Element {
        return <Provider store={this._store}>
                <Sidebar onKeyDown={(key: string) => this._onKeyDown(key)} onEnter={this._onEnterEvent}/>
            </Provider>
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}
