import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import { getCurrentBufferLine } from "./../selectors/BufferSelectors"
import { IState } from "./../State"

// import { getSignatureHelpTriggerColumn } from "./../../Services/Language"

import { getCompletionMeet } from "./../../Services/AutoCompletionUtility"
import { languageManager } from "./../../Services/Language"

const getAutoCompletionRaw = (state: IState) => state.autoCompletion

// TODO: Need to gate the visibility correctly
export const areCompletionsVisible = (state: IState) => {
    const autoCompletion = getAutoCompletion(state)
    const entryCount = (autoCompletion) ? autoCompletion.entries.length : 0

    if (entryCount === 0) {
        return false
    }

    if (entryCount > 1) {
        return true
    }

    // In the case of a single entry, should not be visible if the base is equal to the selected item
    return autoCompletion != null && autoCompletion.base !== getSelectedCompletion(state)
}

export const getSelectedCompletion = (state: IState) => {
    const autoCompletion = getAutoCompletion(state)
    if (!autoCompletion) {
        return null
    }

    const completionData = autoCompletion

    const completion = completionData.filteredEntries[completionData.selectedIndex]
    return completion.insertText ? completion.insertText : completion.label
}

export const getAutoCompletion = createSelector(
    [Selectors.getActiveWindow, getAutoCompletionRaw, getCurrentBufferLine],
    (win, completion, currentLine) => {

    if (!win) {
        return null
    }

    const { file, line, column} = win

    if (!completion) {
        return null
    }

    // If we're not in the same file or line,
    // don't bother.
    if (completion.filePath !== file
        || completion.line !== line) {
            return null
        }

    const tokenRegEx = languageManager.getTokenRegex("typescript")
    const meet = getCompletionMeet(currentLine, column, tokenRegEx)

    if (!meet) {
        return null
    }
    const idx = meet.position + 1

    if (idx !== completion.column) {
        return null
    }

    return completion.data
})
