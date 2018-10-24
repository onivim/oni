/**
 * index.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { TypeScriptServerHost } from "./TypeScriptServerHost"

export const findAllReferences = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    message: string,
    payload: any,
): Promise<types.Location[]> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
    const zeroBasedPosition: types.Position = payload.position

    const oneBasedPosition = {
        line: zeroBasedPosition.line + 1,
        column: zeroBasedPosition.character + 1,
    }

    const val = await host.findAllReferences(
        filePath,
        oneBasedPosition.line,
        oneBasedPosition.column,
    )

    const mapResponseToLocation = (
        referenceItem: protocol.ReferencesResponseItem,
    ): types.Location => {
        const startPosition = types.Position.create(
            referenceItem.start.line - 1,
            referenceItem.start.offset - 1,
        )
        const endPosition = types.Position.create(
            referenceItem.end.line - 1,
            referenceItem.end.offset - 1,
        )
        const range = types.Range.create(startPosition, endPosition)

        return {
            uri: oni.language.wrapPathInFileUri(referenceItem.file),
            range,
        }
    }

    return val.refs.map(v => mapResponseToLocation(v))
}
