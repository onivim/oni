/**
 * Types.ts
 *
 * Helper types
 */

/// <reference path="./../../../../definitions/Oni.d.ts" />
/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as types from "vscode-languageserver-types"

/**
 * IDisplayPart, coming from TSS
 */
export interface IDisplayPart {
    text: string
    kind: string
}

/**
 * TextDocumentPosition, from LSP
 */
export interface ITextDocumentPositionParams {
    textDocument: types.TextDocumentIdentifier
    position: types.Position
}

export interface IRenameParams extends ITextDocumentPositionParams {
    newName: string
}

export interface IDocumentRangeFormattingParams {
    textDocument: types.TextDocumentIdentifier
    range: types.Range
    options: types.FormattingOptions
}
