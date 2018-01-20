/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

// import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import * as Snippets from "vscode-snippet-parser/lib"

import { IBuffer } from "./../../Editor/BufferManager"

export const splitLineAtPosition = (line: string, position: number): [string, string] => {
    const prefix = line.substring(0, position)
    const post = line.substring(position, line.length)
    return [prefix, post]
}

export class SnippetSession {
    private _buffer: IBuffer
    // private _position: types.Position

    // Get state of line where we inserted
    private _prefix: string
    private _suffix: string

    constructor(private _editor: Oni.Editor, private _snippet: Snippets.TextmateSnippet) {}

    public async start(): Promise<void> {
        this._buffer = this._editor.activeBuffer as IBuffer
        const cursorPosition = await this._buffer.getCursorPosition()
        const [currentLine] = await this._buffer.getLines(
            cursorPosition.line,
            cursorPosition.line + 1
        )

        const [prefix, suffix] = splitLineAtPosition(currentLine, cursorPosition.character)

        this._prefix = prefix
        this._suffix = suffix

        await this._buffer.setLines(cursorPosition.line, cursorPosition.line + 1, [
            this._prefix + this._snippet.toString() + this._suffix
        ])
    }
}
