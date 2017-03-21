/**
 * Selectors.ts
 *
 * Selectors are basically helper methods for operating on the State
 * See Redux documents here fore more info:
 * http://redux.js.org/docs/recipes/ComputingDerivedData.html
 */

import * as State from "./State"

export const isPopupMenuOpen = (state: State.IState) => {
    const popupMenu = state.popupMenu
    return !!popupMenu
}

export const areCompletionsVisible = (state: State.IState) => {
    const autoCompletion = state.autoCompletion
    const entryCount = (autoCompletion && autoCompletion.entries) ? autoCompletion.entries.length : 0

    if (entryCount === 0) {
        return false
    }

    if (entryCount > 1) {
        return true
    }

    // In the case of a single entry, should not be visible if the base is equal to the selected item
    return autoCompletion != null && autoCompletion.base !== getSelectedCompletion(state)
}

export const getSelectedCompletion = (state: State.IState) => {
    const autoCompletion = state.autoCompletion
    return autoCompletion ? autoCompletion.entries[autoCompletion.selectedIndex].label : null
}
