/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import * as Log from "./../../Log"

import { OniSnippet, OniSnippetPlaceholder } from "./OniSnippet"

import { IBuffer } from "./../../Editor/BufferManager"
import { IEditor } from "./../../Editor/Editor"

export const splitLineAtPosition = (line: string, position: number): [string, string] => {
    const prefix = line.substring(0, position)
    const post = line.substring(position, line.length)
    return [prefix, post]
}

export const getSmallestPlaceholder = (
    placeholders: OniSnippetPlaceholder[],
): OniSnippetPlaceholder => {
    return placeholders.reduce((prev: OniSnippetPlaceholder, curr: OniSnippetPlaceholder) => {
        if (!prev) {
            return curr
        }

        if (curr.index < prev.index) {
            return curr
        }
        return prev
    }, null)
}

export const getPlaceholderByIndex = (
    placeholders: OniSnippetPlaceholder[],
    index: number,
): OniSnippetPlaceholder | null => {
    const matchingPlaceholders = placeholders.filter(p => p.index === index)

    if (matchingPlaceholders.length === 0) {
        return null
    }

    return matchingPlaceholders[0]
}

export interface IMirrorCursorUpdateEvent {
    mode: Oni.Vim.Mode
    cursors: types.Range[]
}

export class SnippetSession {
    private _buffer: IBuffer
    private _position: types.Position
    private _onCancelEvent: Event<void> = new Event<void>()
    private _onCursorMovedEvent: Event<IMirrorCursorUpdateEvent> = new Event<
        IMirrorCursorUpdateEvent
    >()

    // Get state of line where we inserted
    private _prefix: string
    private _suffix: string

    private _currentPlaceholder: OniSnippetPlaceholder = null

    public get buffer(): IBuffer {
        return this._buffer
    }

    public get onCancel(): IEvent<void> {
        return this._onCancelEvent
    }

    public get onCursorMoved(): IEvent<IMirrorCursorUpdateEvent> {
        return this._onCursorMovedEvent
    }

    public get position(): types.Position {
        return this._position
    }

    public get lines(): string[] {
        return this._snippet.getLines()
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

        const placeholders = this._snippet.getPlaceholders()

        if (!placeholders || placeholders.length === 0) {
            // If no placeholders, we're done with the session
            this._finish()
            return
        }

        await this.nextPlaceholder()
    }

    public async nextPlaceholder(): Promise<void> {
        const placeholders = this._snippet.getPlaceholders()

        if (!this._currentPlaceholder) {
            const newPlaceholder = getSmallestPlaceholder(placeholders)
            this._currentPlaceholder = newPlaceholder
        } else {
            const nextPlaceholder = getPlaceholderByIndex(
                placeholders,
                this._currentPlaceholder.index + 1,
            )
            this._currentPlaceholder = nextPlaceholder || getSmallestPlaceholder(placeholders)
        }

        await this._highlightPlaceholder(this._currentPlaceholder)
    }

    public async previousPlaceholder(): Promise<void> {
        const placeholders = this._snippet.getPlaceholders()

        const nextPlaceholder = getPlaceholderByIndex(
            placeholders,
            this._currentPlaceholder.index - 1,
        )
        this._currentPlaceholder = nextPlaceholder || getSmallestPlaceholder(placeholders)

        await this._highlightPlaceholder(this._currentPlaceholder)
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
        // Update current placeholder
        this._currentPlaceholder = getPlaceholderByIndex(this._snippet.getPlaceholders(), index)
        await this._updateSnippet()
    }

    // Update the cursor position relative to all placeholders
    public async updateCursorPosition(): Promise<void> {
        const pos = await this._buffer.getCursorPosition()

        const mode = this._editor.mode as Oni.Vim.Mode

        if (
            !this._currentPlaceholder ||
            pos.line !== this._currentPlaceholder.line + this._position.line
        ) {
            return
        }

        const boundsForPlaceholder = this._getBoundsForPlaceholder()

        const offset = pos.character - boundsForPlaceholder.start

        const allPlaceholdersAtIndex = this._snippet
            .getPlaceholders()
            .filter(
                f =>
                    f.index === this._currentPlaceholder.index &&
                    !(
                        f.line === this._currentPlaceholder.line &&
                        f.character === this._currentPlaceholder.character
                    ),
            )

        const cursorPositions: types.Range[] = allPlaceholdersAtIndex.map(p => {
            if (mode === "visual") {
                const bounds = this._getBoundsForPlaceholder(p)
                return types.Range.create(
                    bounds.line,
                    bounds.start,
                    bounds.line,
                    bounds.start + bounds.length,
                )
            } else {
                const bounds = this._getBoundsForPlaceholder(p)
                return types.Range.create(
                    bounds.line,
                    bounds.start + offset,
                    bounds.line,
                    bounds.start + offset,
                )
            }
        })

        this._onCursorMovedEvent.dispatch({
            mode,
            cursors: cursorPositions,
        })
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

    private _finish(): void {
        this._onCancelEvent.dispatch()
    }

    private _getBoundsForPlaceholder(
        currentPlaceholder: OniSnippetPlaceholder = this._currentPlaceholder,
    ): {
        index: number
        line: number
        start: number
        length: number
        distanceFromEnd: number
    } {
        const currentSnippetLines = this._snippet.getLines()

        const start =
            currentPlaceholder.line === 0
                ? this._prefix.length + currentPlaceholder.character
                : currentPlaceholder.character
        const length = currentPlaceholder.value.length
        const distanceFromEnd =
            currentSnippetLines[currentPlaceholder.line].length -
            (currentPlaceholder.character + length)
        const line = currentPlaceholder.line + this._position.line

        return { index: currentPlaceholder.index, line, start, length, distanceFromEnd }
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
        if (!currentPlaceholder) {
            return
        }

        const adjustedLine = currentPlaceholder.line + this._position.line
        const adjustedCharacter =
            currentPlaceholder.line === 0
                ? this._position.character + currentPlaceholder.character
                : currentPlaceholder.character
        const placeHolderLength = currentPlaceholder.value.length

        if (placeHolderLength === 0) {
            await (this._editor as any).clearSelection()
            await this._editor.activeBuffer.setCursorPosition(adjustedLine, adjustedCharacter)
        } else {
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
}
