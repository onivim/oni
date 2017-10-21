/**
 * index.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../definitions/Oni.d.ts" />
/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import { getCompletions } from "./Completion"
import { LightweightLanguageClient } from "./LightweightLanguageClient"
import { TypeScriptServerHost } from "./TypeScriptServerHost"

import * as Utility from "./Utility"

export const getSignatureHelp = async (message: string, payload: any): Promise<types.SignatureHelp> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = unwrapFileUriPath(textDocument.uri)
    const oneBasedPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(payload.position)

    const result = await host.getSignatureHelp(filePath, oneBasedPosition.line, oneBasedPosition.column)

    const items = result.items || []

    const signatureHelpItems = items.map((item): types.SignatureInformation => {
        const prefix = convertToDisplayString(item.prefixDisplayParts)
        const suffix = convertToDisplayString(item.suffixDisplayParts)
        const separator = convertToDisplayString(item.separatorDisplayParts)

        const parameters = item.parameters.map((p) => ({
            label: convertToDisplayString(p.displayParts),
            documentation: convertToDisplayString(p.documentation),
        }))

        const parameterLabels = parameters.map((p) => p.label)

        const label = prefix + parameterLabels.join(separator) + suffix

        return {
            label,
            documentation: convertToDisplayString(item.documentation),
            parameters,
        }
    })

    return {
        signatures: signatureHelpItems,
        activeSignature: result.selectedItemIndex,
        activeParameter: result.argumentIndex,
    }
}

