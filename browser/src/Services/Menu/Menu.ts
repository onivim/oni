/**
 * Menu.ts
 *
 * Implements API surface area for working with the status bar
 */

import { bindActionCreators, createStore } from "redux"

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
}

export class Menu {
    constructor(private _id: number) {
    }

    public setLoading(isLoading: boolean): void {
    }

    public setItems(items: string[]): void {

    }

    public show(): void {
        menuActions.showPopupMenu("test" + this._id, [])
    }

    public hide(): void {
        menuActions.hidePopupMenu()
    }
}

export const menuManager = new MenuManager()
