/**
 * Types.ts
 *
 * Helper types
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as types from "vscode-languageserver-types"

/**
 * IDisplayPart, coming from TSS
 */
export interface IDisplayPart {
    text: string
    kind: string
}

export interface ITextDocumentParams {
    textDocument: types.TextDocumentIdentifier
}

export interface ISymbolSearchParams extends ITextDocumentParams {
    query: string
}

/**
 * TextDocumentPosition, from LSP
 */
export interface ITextDocumentPositionParams extends ITextDocumentParams {
    position: types.Position
}

export interface IRenameParams extends ITextDocumentPositionParams {
    newName: string
}

export interface IDocumentRangeFormattingParams extends ITextDocumentParams {
    textDocument: types.TextDocumentIdentifier
    range: types.Range
    options: types.FormattingOptions
}
