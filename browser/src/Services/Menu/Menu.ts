/**
 * Menu.ts
 *
 * Implements API surface area for working with the status bar
 */

import { bindActionCreators, createStore } from "redux"

import { Event, IEvent } from "./../../Event"

import * as ActionCreators from "./MenuActionCreators"
import { reducer } from "./MenuReducer"
import * as State from "./MenuState"

export const menuStore = createStore(reducer, State.createDefaultState())

export const menuActions: typeof ActionCreators = bindActionCreators(ActionCreators as any, menuStore.dispatch)

export class MenuManager {
    private _id: number = 0

    public create(): Menu {
        this._id++
        return new Menu(this._id)
    }

    public isMenuOpen(): boolean {
        return false
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
}

export class Menu {
    private _onItemSelected = new Event<any>()
    private _onFilterTextChanged = new Event<string>()

    public get onItemSelected(): IEvent<any> {
        return this._onItemSelected
    }

    public get onFilterTextChanged(): IEvent<any> {
        return this._onFilterTextChanged
    }

    constructor(private _id: number) {
    }

    public setLoading(isLoading: boolean): void {
    }

    public setItems(items: Oni.Menu.MenuOption): void {

    }

    public show(): void {
        // TODO: Pass in callbacks for events here
        menuActions.showPopupMenu("test" + this._id, [])
    }

    public hide(): void {
        menuActions.hidePopupMenu()
    }
}

export const menuManager = new MenuManager()
