/**
 * Rename.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { IRenameParams } from "./Types"
import { TypeScriptServerHost } from "./TypeScriptServerHost"
import * as Utility from "./Utility"

export const doRename = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    message: string,
    payload: IRenameParams,
): Promise<types.WorkspaceEdit> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
    const oneBasedPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(
        payload.position,
    )

    const val = await host.rename(filePath, oneBasedPosition.line, oneBasedPosition.character)

    if (!val || !val.info.canRename) {
        throw new Error("Unable to rename.")
    }

    const mapLocsToTextEdit = (textSpan: protocol.TextSpan): types.TextEdit => {
        const range = types.Range.create(
            textSpan.start.line - 1,
            textSpan.start.offset - 1,
            textSpan.end.line - 1,
            textSpan.end.offset - 1,
        )
        const newText = payload.newName

        return {
            range,
            newText,
        }
    }

    return val.locs.reduce<any>((previousValue, currentValue) => {
        return {
            ...previousValue,
            [oni.language.wrapPathInFileUri(currentValue.file)]: currentValue.locs.map(l =>
                mapLocsToTextEdit(l),
            ),
        }
    }, {})
}
