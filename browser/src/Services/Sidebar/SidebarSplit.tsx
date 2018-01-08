/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import { Provider } from "react-redux"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { Event } from "oni-types"

import { SidebarManager } from "./SidebarStore"
import { Sidebar } from "./SidebarView"

export class SidebarSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    private _activeBinding: IMenuBinding = null

    constructor(
        private _sidebarManager: SidebarManager = new SidebarManager(),
    ) { }

    public enter(): void {
        this._onEnterEvent.dispatch()

        this._sidebarManager.setFocusedEntry(this._sidebarManager.activeEntryId)

        this._activeBinding = getInstance().bindToMenu()
        const items = this._sidebarManager.entries.map((i) => i.id)
        this._activeBinding.setItems(items, this._sidebarManager.activeEntryId)

        this._activeBinding.onCursorMoved.subscribe((id: string) => {
            this._sidebarManager.setFocusedEntry(id)
        })
    }

    public leave(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }

        this._sidebarManager.setFocusedEntry(null)
    }

    public render(): JSX.Element {
        return <Provider store={this._sidebarManager.store}>
                <Sidebar onKeyDown={(key: string) => this._onKeyDown(key)} onEnter={this._onEnterEvent}/>
            </Provider>
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}
