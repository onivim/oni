/**
 * Utility.ts
 */

import * as types from "vscode-languageserver-types"

import { IDisplayPart } from "./Types"

export const zeroBasedPositionToOneBasedPosition = (zeroBasedPosition: types.Position) => ({
    line: zeroBasedPosition.line + 1,
    character: zeroBasedPosition.character + 1,
})

export const convertToDisplayString = (displayParts: IDisplayPart[]) => {
    let ret = ""

    if (!displayParts || !displayParts.forEach) {
        return ret
    }

    displayParts.forEach((dp) => {
        ret += dp.text
    })

    return ret
}
