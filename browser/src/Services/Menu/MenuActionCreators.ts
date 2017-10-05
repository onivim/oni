/**
 * MenuActionCreators.ts
 */

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

export const selectMenuItem = () => ({

})

// export const selectMenuItem = (openInSplit: string, index?: number) => (dispatch: DispatchFunction, getState: GetStateFunction) => {

//     const state = getState()

//     if (!state || !state.popupMenu) {
//         return
//     }

//     const selectedIndex = index || state.popupMenu.selectedIndex
//     const selectedOption = state.popupMenu.filteredOptions[selectedIndex]

//     Events.events.emit("menu-item-selected:" + state.popupMenu.id, { selectedOption, openInSplit })

//     dispatch(hidePopupMenu())
// }
