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

export const getQuickInfo = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    protocolName: string,
    payload: any,
): Promise<types.Hover> => {
    const textDocument: types.TextDocument = payload.textDocument
    const position: types.Position = payload.position

    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
    const val = await host.getQuickInfo(filePath, position.line + 1, position.character + 1)

    return {
        contents: [val.displayString, val.documentation],
    }
}
