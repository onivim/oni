/**
 * Utility.ts
 */

import * as types from "vscode-languageserver-types"

export const zeroBasedPositionToOneBasedPosition = (zeroBasedPosition: types.Position) => ({
    line: zeroBasedPosition.line + 1,
    column: zeroBasedPosition.character + 1,
})
