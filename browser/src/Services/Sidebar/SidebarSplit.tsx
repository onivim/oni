/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import { Event } from "oni-types"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { createStore, ISidebarState } from "./SidebarStore"
import { Sidebar } from "./SidebarView"

export class SidebarSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    private _activeBinding: IMenuBinding = null
    private _store: Store<ISidebarState>

    constructor() {
        this._store = createStore()
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
