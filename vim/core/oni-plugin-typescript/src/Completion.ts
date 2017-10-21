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

import { ITextDocumentPositionParams } from "./Types"
import { TypeScriptServerHost } from "./TypeScriptServerHost"
import * as Utility from "./Utility"

export const getCompletions = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (message: string, payload: ITextDocumentPositionParams): Promise<types.CompletionItem[]> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
    const oneBasedPosition: types.Position = Utility.zeroBasedPositionToOneBasedPosition(payload.position)

    const val = await host.getCompletions(filePath, oneBasedPosition.line, oneBasedPosition.character, "")

    const results = val
        .map((v) => ({
            label: v.name,
            kind: convertTypeScriptKindToCompletionItemKind(v.kind),
        }))

    return results
}

// TODO: Bring back completion details
// export const getCompletionDetails = (textDocumentPosition: Oni.EventContext, completionItem) => {

//     if (!textDocumentPosition || !textDocumentPosition.bufferFullPath) {
//         return Promise.resolve(null)
//     }

//     return host.getCompletionDetails(textDocumentPosition.bufferFullPath, textDocumentPosition.line, textDocumentPosition.column, [completionItem.label])
//         .then((details) => {
//             const entry = details[0]

//             if (!entry) {
//                 return null
//             }

//             return {
//                 kind: convertTypeScriptKindToCompletionItemKind(entry.kind),
//                 label: entry.name,
//                 documentation: entry.documentation && entry.documentation.length ? entry.documentation[0].text : null,
//                 detail: convertToDisplayString(entry.displayParts),
//             }
//         })
// }

const convertTypeScriptKindToCompletionItemKind = (kind: string): types.CompletionItemKind => {
    const typeScriptKindToCompletionKind = {
        "let": types.CompletionItemKind.Variable,
        "interface": types.CompletionItemKind.Interface,
        "alias": types.CompletionItemKind.Reference,
        "color": types.CompletionItemKind.Color,
        "const": types.CompletionItemKind.Value,
        "constructor": types.CompletionItemKind.Constructor,
        "class": types.CompletionItemKind.Class,
        "type": types.CompletionItemKind.Class,
        "directory": types.CompletionItemKind.File,
        "file": types.CompletionItemKind.File,
        "script": types.CompletionItemKind.File,
        "var": types.CompletionItemKind.Variable,
        "property": types.CompletionItemKind.Property,
        "parameter": types.CompletionItemKind.Variable,
        "module": types.CompletionItemKind.Module,
        "external module name": types.CompletionItemKind.Module,
        "method": types.CompletionItemKind.Method,
        "function": types.CompletionItemKind.Function,
        "unit": types.CompletionItemKind.Unit,
        "keyword": types.CompletionItemKind.Keyword,
        "text": types.CompletionItemKind.Text,
    }

    if (kind && typeScriptKindToCompletionKind[kind]) {
        return typeScriptKindToCompletionKind[kind]
    } else {
        return null
    }
}
