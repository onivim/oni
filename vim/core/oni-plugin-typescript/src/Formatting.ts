/**
 * Formatting.ts
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { IDocumentRangeFormattingParams } from "./Types"
import { TypeScriptServerHost } from "./TypeScriptServerHost"
import * as Utility from "./Utility"

export const formatRange = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    message: string,
    payload: IDocumentRangeFormattingParams,
): Promise<types.TextEdit[]> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)

    const startPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(
        payload.range.start,
    )
    const endPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(
        payload.range.end,
    )

    const val = await host.getFormattingEdits(
        filePath,
        startPosition.line,
        startPosition.character,
        endPosition.line,
        endPosition.character,
    )

    if (!val) {
        throw new Error("No edits.")
    }

    return val.map(edit => Utility.convertCodeEditToTextEdit(edit))
}
