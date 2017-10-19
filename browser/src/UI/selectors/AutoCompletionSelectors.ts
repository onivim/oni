import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import { IState } from "./../State"

// import { languageManager } from "./../../Services/Language"

const getAutoCompletionRaw = (state: IState) => state.autoCompletion

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
