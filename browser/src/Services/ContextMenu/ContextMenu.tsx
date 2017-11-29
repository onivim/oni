/**
 * Menu.ts
 *
 * Implements API surface area for working with the status bar
 */

import * as React from "react"
import { bindActionCreators } from "redux"
import thunk from "redux-thunk"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import * as ActionCreators from "./../Menu/MenuActionCreators"
import { createReducer } from "./../Menu/MenuReducer"
import * as State from "./../Menu/MenuState"

import { createStore } from "./../../Redux"

import * as UI from "./../../UI"
import { ContextMenuContainer } from "./ContextMenuComponent"

// TODO: Remove filtering from the context menu responsibility
const reducer = createReducer<types.CompletionItem, types.CompletionItem>((opts, searchText) => {

    if (!searchText) {
        return opts
    }

    const filterRegEx = new RegExp("^" + searchText.split("").join(".*") + ".*")

    return opts.filter((f) => {
        const textToFilterOn = f.filterText || f.label
        return textToFilterOn.match(filterRegEx)
    })
})

export const contextMenuStore = createStore("CONTEXT-MENU", reducer, State.createDefaultState(), [thunk])
export const contextMenuActions: typeof ActionCreators = bindActionCreators(ActionCreators as any, contextMenuStore.dispatch)

// TODO: This is essentially a duplicate of `MenuManager.ts` - can this be consolidated?
// Can potentially move to a higher-order class that takes contextMenuActions/store as arguments

export class ContextMenuManager {
    private _id: number = 0

    public create(): ContextMenu {
        this._id++
        return new ContextMenu(this._id.toString())
    }

    public isMenuOpen(): boolean {
        return !!contextMenuStore.getState().menu
    }

    public nextMenuItem(): void {
        contextMenuActions.nextMenuItem()
    }

    public previousMenuItem(): void {
        contextMenuActions.previousMenuItem()
    }

    public closeActiveMenu(): void {
        contextMenuActions.hidePopupMenu()
    }

    public selectMenuItem(idx?: number): void {
        const contextMenuState = contextMenuStore.getState()

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

    constructor(private _id: string) {
    }

    public isOpen(): boolean {
        const contextMenuState = contextMenuStore.getState()
        return contextMenuState.menu && contextMenuState.menu.id === this._id
    }

    public setFilter(filter: string): void {

        const contextMenuState = contextMenuStore.getState()

        if (contextMenuState.menu && contextMenuState.menu.filter !== filter) {
            contextMenuActions.filterMenu(filter)
        }
    }

    public setLoading(isLoading: boolean): void {
        contextMenuActions.setMenuLoading(this._id, isLoading)
    }

    public setItems(items: Oni.Menu.MenuOption[]): void {

        if (items === this._lastItems) {
            return
        }

        this._lastItems = items

        contextMenuActions.setMenuItems(this._id, items)
    }

    public show(items?: any[], filter?: string): void {

        const state: any = UI.store.getState()

        const backgroundColor = state.colors["contextMenu.background"]
        const foregroundColor = state.colors["contextMenu.foreground"]
        const borderColor = state.colors["contextMenu.border"] || backgroundColor
        const highlightColor = state.colors["contextMenu.highlight"] || backgroundColor

        const colors = {
            backgroundColor,
            foregroundColor,
            borderColor,
            highlightColor,
        }

        contextMenuActions.showPopupMenu(this._id, {
            ...colors,
            onSelectedItemChanged: (item: any) => this._onSelectedItemChanged.dispatch(item),
            onSelectItem: (idx: number) => this._onItemSelectedHandler(idx),
            onHide: () => this._onHidden(),
            onFilterTextChanged: (newText: string) => this._onFilterTextChanged.dispatch(newText),
        } as any, items, filter)

        UI.Actions.showToolTip(this._getContextMenuId(), <ContextMenuContainer />, {
            openDirection: 2,
            position: null,
            padding: "0px",
        })

    }

    public updateItem(item: any): void {
        contextMenuActions.setDetailedMenuItem(item)
    }

    public hide(): void {
        contextMenuActions.hidePopupMenu()
    }

    private _onItemSelectedHandler(idx?: number): void {

        const selectedOption = this._getSelectedItem(idx)
        this._onItemSelected.dispatch(selectedOption)

        this.hide()
    }

    private _getSelectedItem(idx?: number) {
        const contextMenuState = contextMenuStore.getState()

        if (!contextMenuState.menu) {
            return null
        }

        const index = (typeof idx === "number") ? idx : contextMenuState.menu.selectedIndex

        return contextMenuState.menu.filteredOptions[index]
    }

    private _onHidden(): void {
        UI.Actions.hideToolTip(this._getContextMenuId())
        this._onHide.dispatch()
    }

    private _getContextMenuId(): string {
        return "context_menu_" + this._id.toString()
    }
}

export const contextMenuManager = new ContextMenuManager()
