/**
 * MenuActionCreators.ts
 */

export const showPopupMenu = (id: string) => ({
    type: "SHOW_MENU",
    payload: {
        id,
    },
})

export const setMenuLoading = (id: string, isLoading: boolean) => ({
    type: "SET_MENU_LOADING",
    payload: {
        id,
        isLoading,
    },
})

export const setMenuItems = (id: string, items: Oni.Menu.MenuOption[]) => ({
    type: "SET_MENU_ITEMS",
    payload: {
        id,
        items,
    }
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
