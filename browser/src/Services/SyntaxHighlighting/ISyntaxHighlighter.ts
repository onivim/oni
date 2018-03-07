/**
 * ISyntaxHighlighter.ts
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { IDisposable } from "oni-types"

import { ISyntaxHighlightTokenInfo } from "./SyntaxHighlightingStore"

export interface ISyntaxHighlighter extends IDisposable {
    notifyBufferUpdate(evt: Oni.EditorBufferChangedEventArgs): Promise<void>
    notifyViewportChanged(bufferId: string, topLineInView: number, bottomLineInView: number): void

    getHighlightTokenAt(bufferId: string, position: types.Position): ISyntaxHighlightTokenInfo
}
