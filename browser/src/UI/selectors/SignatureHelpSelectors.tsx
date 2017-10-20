/**
 * SignatureHelpSelectors.tsx
 */

import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import { IState } from "./../State"

const getSignatureHelpRaw = (state: IState) => state.signatureHelp

export const getSignatureHelp = createSelector(
    [Selectors.getActiveWindow, getSignatureHelpRaw],
    (win, signatureHelp) => {

    if (!win) {
        return null
    }

    const { file, line, column } = win

    if (!signatureHelp) {
        return null
    }

    if (signatureHelp.filePath !== file
        // TODO: Fix off by one hack...
        || signatureHelp.line + 1 !== line
        || signatureHelp.column + 1 !== column) {
            return null
        }

    return signatureHelp.data
})
