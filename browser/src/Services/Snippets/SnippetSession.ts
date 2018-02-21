/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import * as types from "vscode-languageserver-types"

import { IEvent, Event } from "oni-types"

import * as Log from "./../../Log"

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
    private _onCancelEvent: Event<void> = new Event<void>()

    // Get state of line where we inserted
    private _prefix: string
    private _suffix: string

    private _placeholderIndex: number = -1

    public get onCancel(): IEvent<void> {
        return this._onCancelEvent
    }

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
        const previousValue = this._snippet.getPlaceholderValue(index)

        if (previousValue === val) {
            Log.verbose(
                "[SnippetSession::setPlaceHolderValue] Skipping because new placeholder value is same as previous",
            )
            return
        }

        await this._snippet.setPlaceholder(index, val)
        await this._updateSnippet()
    }

    // Helper method to query the value of the current placeholder,
    // propagate that to any other placeholders, and update the snippet
    public async synchronizeUpdatedPlaceholders(): Promise<void> {
        // Get current cursor position
        const cursorPosition = await this._buffer.getCursorPosition()

        const bounds = this._getBoundsForPlaceholder()

        if (cursorPosition.line !== bounds.line) {
            Log.info(
                "[SnippetSession::synchronizeUpdatedPlaceholder] Cursor outside snippet, cancelling snippet session",
            )
            this._onCancelEvent.dispatch()
            return
        }

        // Check substring of placeholder start / placeholder finish
        const [currentLine] = await this._buffer.getLines(bounds.line, bounds.line + 1)

        const startPosition = bounds.start
        const endPosition = currentLine.length - bounds.distanceFromEnd

        if (
            cursorPosition.character < startPosition ||
            cursorPosition.character > endPosition + 2
        ) {
            return
        }

        // Set placeholder value
        const newPlaceholderValue = currentLine.substring(startPosition, endPosition)
        await this.setPlaceholderValue(bounds.index, newPlaceholderValue)
    }

    private _getBoundsForPlaceholder(): {
        index: number
        line: number
        start: number
        distanceFromEnd: number
    } {
        const placeholders = this._snippet.getPlaceholders()
        const currentPlaceholder = placeholders[this._placeholderIndex]

        const currentSnippetLines = this._snippet.getLines()

        const start =
            currentPlaceholder.line === 0
                ? this._prefix.length + currentPlaceholder.character
                : currentPlaceholder.character
        const distanceFromEnd =
            currentSnippetLines[currentPlaceholder.line].length -
            (currentPlaceholder.character + currentPlaceholder.value.length)
        const line = currentPlaceholder.line + this._position.line

        return { index: currentPlaceholder.index, line, start, distanceFromEnd }
    }

    private async _updateSnippet(): Promise<void> {
        const snippetLines = this._snippet.getLines()
        const lastIndex = snippetLines.length - 1
        snippetLines[0] = this._prefix + snippetLines[0]
        snippetLines[lastIndex] = snippetLines[lastIndex] + this._suffix

        await this._buffer.setLines(
            this._position.line,
            this._position.line + snippetLines.length,
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
