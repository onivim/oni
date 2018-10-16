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

export const getDefinition = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    protocolName: string,
    payload: any,
): Promise<types.Location> => {
    const textDocument: types.TextDocument = payload.textDocument
    const position: types.Position = payload.position

    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
    const val: any = await host.getDefinition(filePath, position.line + 1, position.character + 1)

    const resultPos = val[0]

    if (!resultPos) {
        return null
    }

    const range = types.Range.create(
        resultPos.start.line - 1,
        resultPos.start.offset - 1,
        resultPos.end.line - 1,
        resultPos.end.offset - 1,
    )

    return {
        uri: oni.language.wrapPathInFileUri(resultPos.file),
        range,
    }
}
