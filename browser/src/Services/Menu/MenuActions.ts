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

export const showPopupMenu = (id: string, options: Oni.Menu.MenuOption[]) => ({
    type: "SHOW_MENU",
    payload: {
        id,
        options,
    },
})

export const hidePopupMenu = () => ({
    type: "HIDE_MENU",
})

export const previousMenuItem = () => ({
    type: "PREVIOUS_MENU",
})

export const filterMenu = (filterString: string) => ({
    type: "FILTER_MENU",
    payload: {
        filter: filterString,
    },
})

export const nextMenuItem = () => ({
    type: "NEXT_MENU",
})

export const selectMenuItem = (openInSplit: string, index?: number) => (dispatch: DispatchFunction, getState: GetStateFunction) => {

    const state = getState()

    if (!state || !state.popupMenu) {
        return
    }

    const selectedIndex = index || state.popupMenu.selectedIndex
    const selectedOption = state.popupMenu.filteredOptions[selectedIndex]

    Events.events.emit("menu-item-selected:" + state.popupMenu.id, { selectedOption, openInSplit })

    dispatch(hidePopupMenu())
}
