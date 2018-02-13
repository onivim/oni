import * as types from "vscode-languageserver-types"

import { TokenColor } from "./../TokenColors"

export interface HighlightInfo {
    range: types.Range
    tokenColor: TokenColor
}
