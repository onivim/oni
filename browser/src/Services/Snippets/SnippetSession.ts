/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import * as types from "vscode-languageserver-types"

import { OniSnippet } from "./OniSnippet"

import { IBuffer } from "./../../Editor/BufferManager"
import { IEditor } from "./../../Editor/Editor"

export const splitLineAtPosition = (line: string, position: number): [string, string] => {
    const prefix = line.substring(0, position)
    const post = line.substring(position, line.length)
    return [prefix, post]
}

export class SnippetSession {
    private _buffer: IBuffer
    private _position: types.Position

    // Get state of line where we inserted
    private _prefix: string
    private _suffix: string

    private _placeholderIndex: number = 0

    constructor(private _editor: IEditor, private _snippet: OniSnippet) {}

    public async start(): Promise<void> {
        this._buffer = this._editor.activeBuffer as IBuffer
        const cursorPosition = await this._buffer.getCursorPosition()
        const [currentLine] = await this._buffer.getLines(
            cursorPosition.line,
            cursorPosition.line + 1,
        )

        this._position = cursorPosition

        const [prefix, suffix] = splitLineAtPosition(currentLine, cursorPosition.character)

        this._prefix = prefix
        this._suffix = suffix

        const snippetLines = this._snippet.getLines()
        const lastIndex = snippetLines.length - 1
        snippetLines[0] = this._prefix + snippetLines[0]
        snippetLines[lastIndex] = snippetLines[lastIndex] + this._suffix

        await this._buffer.setLines(
            cursorPosition.line,
            cursorPosition.line + snippetLines.length,
            snippetLines,
        )
    }

    public async nextPlaceholder(): Promise<void> {
        const placeholders = this._snippet.getPlaceholders()

        const firstPlaceholder = placeholders[this._placeholderIndex]
        this._placeholderIndex++

        const adjustedLine = firstPlaceholder.line + this._position.line
        const adjustedCharacter =
            firstPlaceholder.line === 0
                ? this._position.character + firstPlaceholder.character
                : firstPlaceholder.character
        const placeHolderLength = firstPlaceholder.value.length

        await this._editor.setSelection(
            types.Range.create(
                adjustedLine,
                adjustedCharacter,
                adjustedLine,
                adjustedCharacter + placeHolderLength,
            ),
        )
    }
}
