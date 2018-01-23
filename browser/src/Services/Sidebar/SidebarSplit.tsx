/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import { Provider } from "react-redux"

import { SidebarManager } from "./SidebarStore"
import { Sidebar } from "./SidebarView"

export class SidebarSplit {

    constructor(
        private _sidebarManager: SidebarManager = new SidebarManager(),
    ) { }

    public enter(): void {
        this._sidebarManager.setActiveEntry(this._sidebarManager.activeEntryId)
        this._sidebarManager.enter()
    }

    public leave(): void {
        this._sidebarManager.setActiveEntry(null)
        this._sidebarManager.leave()
    }

    public render(): JSX.Element {
        return <Provider store={this._sidebarManager.store}>
                <Sidebar onSelectionChanged={(val) => this._onSelectionChanged(val)}/>
            </Provider>
    }

    private _onSelectionChanged(newVal: string): void {
        this._sidebarManager.setActiveEntry(newVal)
    }
}
