/**
 * Formatting.ts
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { ISymbolSearchParams, ITextDocumentParams } from "./Types"
import { TypeScriptServerHost } from "./TypeScriptServerHost"
import * as Utility from "./Utility"

export const getWorkspaceSymbols = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    message: string,
    payload: ISymbolSearchParams,
): Promise<types.SymbolInformation[]> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
    const query = payload.query

    if (!query) {
        return []
    }

    const result = await host.navTo(filePath, query)

    const convertNavtoItemToSymbolInformation = (
        item: protocol.NavtoItem,
    ): types.SymbolInformation => {
        return {
            name: item.name,
            kind: Utility.convertTypeScriptKindToSymbolKind(item.kind),
            containerName: item.containerName,
            location: types.Location.create(
                oni.language.wrapPathInFileUri(item.file),
                types.Range.create(
                    item.start.line - 1,
                    item.start.offset - 1,
                    item.end.line - 1,
                    item.end.offset - 1,
                ),
            ),
        }
    }

    return result.map(item => convertNavtoItemToSymbolInformation(item))
}

export const getDocumentSymbols = (oni: Oni.Plugin.Api, host: TypeScriptServerHost) => async (
    message: string,
    payload: ITextDocumentParams,
): Promise<types.SymbolInformation[]> => {
    const textDocument: types.TextDocumentIdentifier = payload.textDocument
    const filePath = oni.language.unwrapFileUriPath(textDocument.uri)

    const items = await host.getNavigationTree(filePath)

    const ret = []

    const convertNavigationTreeToSymbolInformation = (
        item: protocol.NavigationTree,
    ): types.SymbolInformation => ({
        name: item.text,
        containerName: filePath,
        kind: Utility.convertTypeScriptKindToSymbolKind(item.kind),
        location: Utility.convertTextSpanToLocation(textDocument.uri, item.spans[0]),
    })

    const appendItemToResults = (
        item: protocol.NavigationTree,
        results: types.SymbolInformation[],
    ) => {
        results.push(convertNavigationTreeToSymbolInformation(item))

        if (item.childItems) {
            item.childItems.forEach(childItem => appendItemToResults(childItem, results))
        }
    }

    appendItemToResults(items, ret)

    return ret
}
