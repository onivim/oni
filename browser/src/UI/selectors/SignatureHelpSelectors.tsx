/**
 * SignatureHelpSelectors.tsx
 */

import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import { getActiveBuffer } from "./../selectors/BufferSelectors"
import { IState } from "./../State"

// import { languageManager } from "./../../Services/Language"
//

import { getSignatureHelpTriggerColumn } from "./../../Services/Language"

const getSignatureHelpRaw = (state: IState) => state.signatureHelp

export const getSignatureHelp = createSelector(
    [Selectors.getActiveWindow, getSignatureHelpRaw, getActiveBuffer],
    (win, signatureHelp, buffer) => {

    if (!win || !signatureHelp) {
        return null
    }

    const { file, line, column } = win

    if (signatureHelp.filePath !== file
        || signatureHelp.line !== line) {
            return null
        }



    if (!buffer.lines) {
        return null
    }

    const currentLine = buffer.lines[line]

    const signatureHelpTriggerCharacters = ["("]

    const idx = getSignatureHelpTriggerColumn(currentLine, column, signatureHelpTriggerCharacters)

    if (signatureHelp.column !== idx) {
        return  null
    } else {
        return signatureHelp.data
    }
})
