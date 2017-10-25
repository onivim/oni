/**
 * Formatting.ts
 */

/// <reference path="./../../../../definitions/Oni.d.ts" />
/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import { IDocumentRangeFormattingParams } from "./Types"
import { TypeScriptServerHost } from "./TypeScriptServerHost"
import * as Utility from "./Utility"

export const formatRange = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (message: string, payload: IDocumentRangeFormattingParams): Promise<types.TextEdit[]> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)

    const startPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(payload.range.start)
    const endPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(payload.range.end)

    const val = await host.getFormattingEdits(filePath, startPosition.line, startPosition.character, endPosition.line, endPosition.character)

    if (!val) {
        throw new Error("No edits.")
    }

    const mapLocsToTextEdit = (codeEdit: protocol.CodeEdit): types.TextEdit => {
       const range = types.Range.create(codeEdit.start.line - 1, codeEdit.start.offset - 1, codeEdit.end.line - 1, codeEdit.end.offset - 1)
       const newText = codeEdit.newText

       return {
           range,
           newText,
       }
    }

    return val.map((edit) => mapLocsToTextEdit(edit))
}
