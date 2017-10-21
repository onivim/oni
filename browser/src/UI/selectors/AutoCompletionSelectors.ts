import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import { IState } from "./../State"

// import { languageManager } from "./../../Services/Language"

const getAutoCompletionRaw = (state: IState) => state.autoCompletion

// TODO: Need to gate the visibility correctly
export const areCompletionsVisible = (state: IState) => {
    const autoCompletion = state.autoCompletion
    const entryCount = (autoCompletion && autoCompletion.data && autoCompletion.data.entries) ? autoCompletion.data.entries.length : 0

    if (entryCount === 0) {
        return false
    }

    if (entryCount > 1) {
        return true
    }

    // In the case of a single entry, should not be visible if the base is equal to the selected item
    return autoCompletion != null && autoCompletion.data.base !== getSelectedCompletion(state)
}

export const getSelectedCompletion = (state: IState) => {
    const autoCompletion = state.autoCompletion
    if (!autoCompletion || !autoCompletion.data) {
        return null
    }

    const completionData = autoCompletion.data

    const completion = completionData.filteredEntries[completionData.selectedIndex]
    return completion.insertText ? completion.insertText : completion.label
}

export const getAutoCompletion = createSelector(
    [Selectors.getActiveWindow, getAutoCompletionRaw],
    (win, completion) => {

    if (!win) {
        return null
    }

    const { file, line /*, column */} = win

    if (!completion) {
        return null
    }

    // If we're not in the same file or line,
    // don't bother.
    if (completion.filePath !== file
        || completion.line !== line) {
            return null
        }

    // const tokenRegEx = languageManager.getTokenRegex("typescript")

    // TODO:
    //  -Need buffer language
    //  -Need buffer line

    // Work backward in the buffer to see if there is a match...

    // for(let i = column; i >= 0; i--) {

    // }

    // if (completion.filePath !== file
    //     || completion.line !== line
    //     || completion.column !== column) {
    //         return null
    //     }

    return completion.data
})
