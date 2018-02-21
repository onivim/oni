/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import * as types from "vscode-languageserver-types"

import { OniSnippet, OniSnippetPlaceholder } from "./OniSnippet"

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

    private _placeholderIndex: number = -1

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

        await this._buffer.setLines(cursorPosition.line, cursorPosition.line + 1, snippetLines)

        await this.nextPlaceholder()
    }

    public async nextPlaceholder(): Promise<void> {
        const placeholders = this._snippet.getPlaceholders()

        this._placeholderIndex = (this._placeholderIndex + 1) % placeholders.length
        const currentPlaceholder = placeholders[this._placeholderIndex]

        await this._highlightPlaceholder(currentPlaceholder)
    }

    public async previousPlaceholder(): Promise<void> {
        const placeholders = this._snippet.getPlaceholders()

        this._placeholderIndex = (this._placeholderIndex - 1) % placeholders.length
        const currentPlaceholder = placeholders[this._placeholderIndex]

        await this._highlightPlaceholder(currentPlaceholder)
    }

    public async setPlaceholderValue(index: number, val: string): Promise<void> {
        await this._snippet.setPlaceholder(index, val)
        await this._updateSnippet()

        const placeholders = this._snippet.getPlaceholders()
        await this._highlightPlaceholder(placeholders[this._placeholderIndex])
    }

    private async _updateSnippet(): Promise<void> {
        const snippetLines = this._snippet.getLines()
        const lastIndex = snippetLines.length - 1
        snippetLines[0] = this._prefix + snippetLines[0]
        snippetLines[lastIndex] = snippetLines[lastIndex] + this._suffix

        await this._buffer.setLines(
            this._position.line,
            this._position.line + snippetLines.length + 1,
            snippetLines,
        )
    }

    private async _highlightPlaceholder(currentPlaceholder: OniSnippetPlaceholder): Promise<void> {
        const adjustedLine = currentPlaceholder.line + this._position.line
        const adjustedCharacter =
            currentPlaceholder.line === 0
                ? this._position.character + currentPlaceholder.character
                : currentPlaceholder.character
        const placeHolderLength = currentPlaceholder.value.length

        await this._editor.setSelection(
            types.Range.create(
                adjustedLine,
                adjustedCharacter,
                adjustedLine,
                adjustedCharacter + placeHolderLength - 1,
            ),
        )
    }
}
