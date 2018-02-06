/**
 * Edits.ts
 *
 * Helpers to work with TextEdits and buffer manipulation
 */

import * as orderBy from "lodash/orderBy"
import * as types from "vscode-languageserver-types"

export const sortTextEdits = (edits: types.TextEdit[]): types.TextEdit[] => {
    const sortedEdits = orderBy(
        edits,
        [e => e.range.start.line, e => e.range.start.character],
        ["desc", "desc"],
    )
    return sortedEdits
}

export const convertTextDocumentEditsToFileMap = (
    edits: types.TextDocumentEdit[],
): { [fileUri: string]: types.TextEdit[] } => {
    if (!edits) {
        return {}
    }

    return edits.reduce((prev, curr) => {
        return {
            ...prev,
            [curr.textDocument.uri]: edits,
        }
    }, {})
}
