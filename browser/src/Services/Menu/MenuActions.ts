/**
 * Menu.ts
 *
 * Implements API surface area for working with the status bar
 */

export interface IMenuOptions {
    foregroundColor?: string
    backgroundColor?: string
    onSelectItem?: (idx: number) => void
    onHide?: () => void
    onFilterTextChanged?: (newText: string) => void
}

export interface IShowMenuAction {
    type: "SHOW_MENU",
    payload: {
        id: string,
        options: IMenuOptions,
    }
}

export interface ISetMenuItems {
    type: "SET_MENU_ITEMS",
    payload: {
        id: string,
        items: Oni.Menu.MenuOption[],
    }
}

export interface ISetMenuLoading {
    type: "SET_MENU_LOADING",
    payload: {
        id: string,
        isLoading: boolean,
    }
}

export interface IFilterMenuAction {
    type: "FILTER_MENU",
    payload: {
        id: string,
        filter: string,
    }
}

export interface IHideMenuAction {
    type: "HIDE_MENU"
}

export interface INextMenuAction {
    type: "NEXT_MENU"
}

export interface IPreviousMenuAction {
    type: "PREVIOUS_MENU"
}

export type MenuAction =
    IShowMenuAction |
    ISetMenuLoading |
    ISetMenuItems |
    IFilterMenuAction |
    IHideMenuAction |
    INextMenuAction |
    IPreviousMenuAction
