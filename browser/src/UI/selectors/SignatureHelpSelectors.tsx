import * as React from "react"
import { createSelector } from "reselect"
import * as types from "vscode-languageserver-types"

import * as Colors from "./../Colors"
import { ErrorInfo } from "./../components/ErrorInfo"
import { QuickInfoDocumentation, QuickInfoTitle } from "./../components/QuickInfo"
import * as Selectors from "./../Selectors"
import { IState } from "./../State"

const getSignatureHelpRaw = (state: IState) => state.signatureHelp

export const getQuickInfo = createSelector(
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
        || signatureHelp.line !== line
        || signatureHelp.column !== column) {
            return null
        }

    return signatureHelp.data
})

