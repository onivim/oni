/**
 * Menu.ts
 *
 * Implements API surface area for working with the status bar
 */

import * as React from "react"
import { bindActionCreators, Store } from "redux"
import thunk from "redux-thunk"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { IToolTipsProvider } from "./../../Editor/NeovimEditor/ToolTipsProvider"
import { createStore } from "./../../Redux"

import * as ActionCreators from "./../Menu/MenuActionCreators"
import { createReducer } from "./../Menu/MenuReducer"
import * as State from "./../Menu/MenuState"

import { ContextMenuContainer } from "./ContextMenuComponent"

// TODO: Remove filtering from the context menu responsibility
const reducer = createReducer<types.CompletionItem, types.CompletionItem>()
const noopFilter = (opts: types.CompletionItem[], searchText: string): types.CompletionItem[] =>
    opts

// TODO: This is essentially a duplicate of `MenuManager.ts` - can this be consolidated?
// Can potentially move to a higher-order class that takes contextMenuActions/store as arguments
export type ContextMenuState = State.IMenus<types.CompletionItem, types.CompletionItem>

export class ContextMenuManager {
    private _id: number = 0

    private _store: Store<ContextMenuState>
    private _actions: typeof ActionCreators

    constructor(private _toolTips: IToolTipsProvider) {
        this._store = createStore("CONTEXT-MENU", reducer, State.createDefaultState(), [thunk])
        this._actions = bindActionCreators(ActionCreators as any, this._store.dispatch)
    }

    public create(): ContextMenu {
        this._id++
        return new ContextMenu(this._id.toString(), this._store, this._actions, this._toolTips)
    }

    public isMenuOpen(): boolean {
        return !!this._store.getState().menu
    }

    public nextMenuItem(): void {
        this._actions.nextMenuItem()
    }

    public previousMenuItem(): void {
        this._actions.previousMenuItem()
    }

    public closeActiveMenu(): void {
        this._actions.hidePopupMenu()
    }

    public selectMenuItem(idx?: number): void {
        const contextMenuState = this._store.getState()

        if (contextMenuState && contextMenuState.menu) {
            contextMenuState.menu.onSelectItem(idx)
        }
    }
}

export class ContextMenu {
    private _onItemSelected = new Event<any>()
    private _onFilterTextChanged = new Event<string>()
    private _onHide = new Event<void>()
    private _onSelectedItemChanged = new Event<any>()

    private _lastItems: any = null

    public get onHide(): IEvent<void> {
        return this._onHide
    }

    public get onItemSelected(): IEvent<any> {
        return this._onItemSelected
    }

    public get onSelectedItemChanged(): IEvent<any> {
        return this._onSelectedItemChanged
    }

    public get onFilterTextChanged(): IEvent<string> {
        return this._onFilterTextChanged
    }

    public get selectedItem() {
        return this._getSelectedItem()
    }

    constructor(
        private _id: string,
        private _store: Store<State.IMenus<types.CompletionItem, types.CompletionItem>>,
        private _actions: typeof ActionCreators,
        private _toolTips: IToolTipsProvider,
    ) {}

    public isOpen(): boolean {
        const contextMenuState = this._store.getState()
        return contextMenuState.menu && contextMenuState.menu.id === this._id
    }

    public setFilter(filter: string): void {
        const contextMenuState = this._store.getState()

        if (contextMenuState.menu && contextMenuState.menu.filter !== filter) {
            this._actions.filterMenu(filter)
        }
    }

    public setLoading(isLoading: boolean): void {
        this._actions.setMenuLoading(this._id, isLoading)
    }

    public setItems(items: Oni.Menu.MenuOption[]): void {
        if (items === this._lastItems) {
            return
        }

        this._lastItems = items

        this._actions.setMenuItems(this._id, items)
    }

    public show(items?: any[], filter?: string): void {
        this._actions.showPopupMenu(
            this._id,
            {
                filterFunction: noopFilter,
                onSelectedItemChanged: (item: any) => this._onSelectedItemChanged.dispatch(item),
                onSelectItem: (idx: number) => this._onItemSelectedHandler(idx),
                onHide: () => this._onHidden(),
                onFilterTextChanged: (newText: string) =>
                    this._onFilterTextChanged.dispatch(newText),
            } as any,
            items,
            filter,
        )

        this._toolTips.showToolTip(
            this._getContextMenuId(),
            <ContextMenuContainer store={this._store} />,
            {
                openDirection: 2,
                position: null,
                padding: "0px",
            },
        )
    }

    public hide(): void {
        this._actions.hidePopupMenu()
    }

    private _onItemSelectedHandler(idx?: number): void {
        const selectedOption = this._getSelectedItem(idx)
        this._onItemSelected.dispatch(selectedOption)

        this.hide()
    }

    private _getSelectedItem(idx?: number) {
        const contextMenuState = this._store.getState()

        if (!contextMenuState.menu) {
            return null
        }

        const index = typeof idx === "number" ? idx : contextMenuState.menu.selectedIndex

        return contextMenuState.menu.filteredOptions[index]
    }

    private _onHidden(): void {
        this._toolTips.hideToolTip(this._getContextMenuId())
        this._onHide.dispatch()
    }

    private _getContextMenuId(): string {
        return "context_menu_" + this._id.toString()
    }
}
