/**
 * Menu.ts
 *
 * Implements API surface area for working with the status bar
 */

export interface IShowMenuAction {
    type: "SHOW_MENU",
    payload: {
        id: string
        options: Oni.Menu.MenuOption[],
    }
}

export interface IFilterMenuAction {
    type: "FILTER_MENU",
    payload: {
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
    IFilterMenuAction |
    IHideMenuAction |
    INextMenuAction |
    IPreviousMenuAction
