/**
 * SignatureHelpSelectors.tsx
 */

import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import { getCurrentBufferLine } from "./../selectors/BufferSelectors"
import { IState } from "./../State"

// import { languageManager } from "./../../Services/Language"
//

import { getSignatureHelpTriggerColumn } from "./../../Services/Language"

const getSignatureHelpRaw = (state: IState) => state.signatureHelp

export const getSignatureHelp = createSelector(
    [Selectors.getActiveWindow, getSignatureHelpRaw, getCurrentBufferLine],
    (win, signatureHelp, currentLine) => {

    if (!win || !signatureHelp || !currentLine) {
        return null
    }

    const { file, line, column } = win

    if (signatureHelp.filePath !== file
        || signatureHelp.line !== line) {
            return null
        }

    const signatureHelpTriggerCharacters = ["("]

    const idx = getSignatureHelpTriggerColumn(currentLine, column, signatureHelpTriggerCharacters)

    if (signatureHelp.column !== idx) {
        return  null
    } else {
        return signatureHelp.data
    }
})
