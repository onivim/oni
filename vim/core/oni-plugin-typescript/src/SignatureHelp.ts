/**
 * index.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { getCompletions } from "./Completion"
import { LightweightLanguageClient } from "./LightweightLanguageClient"
import { TypeScriptServerHost } from "./TypeScriptServerHost"

import { ITextDocumentPositionParams } from "./Types"
import * as Utility from "./Utility"

export const getSignatureHelp = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    message: string,
    payload: any,
): Promise<types.SignatureHelp> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
    const oneBasedPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(
        payload.position,
    )

    const result = await host.getSignatureHelp(
        filePath,
        oneBasedPosition.line,
        oneBasedPosition.character,
    )

    const items = result.items || []

    const signatureHelpItems = items.map((item): types.SignatureInformation => {
        const prefix = Utility.convertToDisplayString(item.prefixDisplayParts)
        const suffix = Utility.convertToDisplayString(item.suffixDisplayParts)
        const separator = Utility.convertToDisplayString(item.separatorDisplayParts)

        const parameters = item.parameters.map(p => ({
            label: Utility.convertToDisplayString(p.displayParts),
            documentation: Utility.convertToDisplayString(p.documentation),
        }))

        const parameterLabels = parameters.map(p => p.label)

        const label = prefix + parameterLabels.join(separator) + suffix

        return {
            label,
            documentation: Utility.convertToDisplayString(item.documentation),
            parameters,
        }
    })

    return {
        signatures: signatureHelpItems,
        activeSignature: result.selectedItemIndex,
        activeParameter: result.argumentIndex,
    }
}
