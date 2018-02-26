/**
 * Menu.ts
 *
 * Implements API surface area for working with the status bar
 */

import { applyMiddleware, bindActionCreators, createStore } from "redux"
import thunk from "redux-thunk"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import * as ActionCreators from "./MenuActionCreators"
import * as MenuFilter from "./MenuFilter"
import { createReducer } from "./MenuReducer"
import * as State from "./MenuState"

import { MenuContainer } from "./MenuComponent"

import { Configuration } from "./../Configuration"
import { Overlay, OverlayManager } from "./../Overlay"

export interface IMenuOptionWithHighlights extends Oni.Menu.MenuOption {
    labelHighlights: number[]
    detailHighlights: number[]
}

export type MenuState = State.IMenus<Oni.Menu.MenuOption, IMenuOptionWithHighlights>

const reducer = createReducer<Oni.Menu.MenuOption, IMenuOptionWithHighlights>()

export const menuStore = createStore<MenuState>(
    reducer,
    State.createDefaultState<Oni.Menu.MenuOption, IMenuOptionWithHighlights>(),
    applyMiddleware(thunk),
)

export const menuActions: typeof ActionCreators = bindActionCreators(
    ActionCreators as any,
    menuStore.dispatch,
)

export const sanitizeConfigurationValue = (value: any, defaultValue: number): number => {
    const parsedValue = parseInt(value, 10)
    return parsedValue > 0 ? parsedValue : defaultValue
}

export class MenuManager {
    private _id: number = 0
    private _overlay: Overlay

    constructor(private _configuration: Configuration, private _overlayManager: OverlayManager) {
        this._overlay = this._overlayManager.createItem()
        this._overlay.setContents(MenuContainer())
        this._overlay.show()

        this._configuration.onConfigurationChanged.subscribe(() => {
            this._updateConfiguration()
        })

        this._updateConfiguration()
    }

    public create(): Menu {
        this._id++
        return new Menu(this._id.toString())
    }

    public isMenuOpen(): boolean {
        return !!menuStore.getState().menu
    }

    public nextMenuItem(): void {
        menuActions.nextMenuItem()
    }

    public previousMenuItem(): void {
        menuActions.previousMenuItem()
    }

    public closeActiveMenu(): void {
        menuActions.hidePopupMenu()
    }

    public selectMenuItem(idx?: number): void {
        const menuState = menuStore.getState()

        if (menuState && menuState.menu) {
            menuState.menu.onSelectItem(idx)
        }
    }

    private _updateConfiguration(): void {
        const values = this._configuration.getValues()
        const rowHeightUnsanitized = values["menu.rowHeight"]
        const maxItemsUnsanitized = values["menu.maxItemsToShow"]

        menuActions.setMenuConfiguration(
            sanitizeConfigurationValue(rowHeightUnsanitized, 40),
            sanitizeConfigurationValue(maxItemsUnsanitized, 6),
        )
    }
}

export class Menu implements Oni.Menu.MenuInstance {
    private _onItemSelected = new Event<any>()
    private _onSelectedItemChanged = new Event<Oni.Menu.MenuOption>()
    private _onFilterTextChanged = new Event<string>()
    private _onHide = new Event<void>()
    private _filterFunction = MenuFilter.fuseFilter

    public get onHide(): IEvent<void> {
        return this._onHide
    }

    public get onItemSelected(): IEvent<any> {
        return this._onItemSelected
    }

    public get onSelectedItemChanged(): IEvent<Oni.Menu.MenuOption> {
        return this._onSelectedItemChanged
    }

    public get onFilterTextChanged(): IEvent<string> {
        return this._onFilterTextChanged
    }

    public get selectedItem() {
        return this._getSelectedItem()
    }

    constructor(private _id: string) {}

    public isOpen(): boolean {
        const menuState = menuStore.getState()
        return menuState.menu && menuState.menu.id === this._id
    }

    public setLoading(isLoading: boolean): void {
        menuActions.setMenuLoading(this._id, isLoading)
    }

    public setItems(items: Oni.Menu.MenuOption[]): void {
        menuActions.setMenuItems(this._id, items)
    }

    public setFilterFunction(
        filterFunc: (
            items: Oni.Menu.MenuOption[],
            searchString: string,
        ) => IMenuOptionWithHighlights[],
    ) {
        this._filterFunction = filterFunc
    }

    public show(): void {
        menuActions.showPopupMenu(this._id, {
            filterFunction: this._filterFunction,
            onSelectedItemChanged: item => this._onSelectedItemChanged.dispatch(item),
            onSelectItem: (idx: number) => this._onItemSelectedHandler(idx),
            onHide: () => this._onHide.dispatch(),
            onFilterTextChanged: newText => this._onFilterTextChanged.dispatch(newText),
        })
    }

    public hide(): void {
        menuActions.hidePopupMenu()
    }

    private _onItemSelectedHandler(idx?: number): void {
        const selectedOption = this._getSelectedItem(idx)
        this._onItemSelected.dispatch(selectedOption)

        this.hide()
    }

    private _getSelectedItem(idx?: number) {
        const menuState = menuStore.getState()

        if (!menuState.menu) {
            return null
        }

        const index = typeof idx === "number" ? idx : menuState.menu.selectedIndex

        return menuState.menu.filteredOptions[index]
    }
}
