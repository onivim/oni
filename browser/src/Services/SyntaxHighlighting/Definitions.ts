import * as types from "vscode-languageserver-types"

export interface IHighlight {
    foregroundColor: string
    backgroundColor: string

    bold: boolean
    italic: boolean
}

export type HighlightGroupId = string

export interface HighlightInfo {
    range: types.Range
    highlightGroup: HighlightGroupId
}
