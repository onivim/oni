/**
 * OniSnippet.ts
 *
 * Wrapper around `TextmateSnippet`. There are some differences in behavior
 * due to differences in editor behavior, for Oni/Neovim, we need to
 * get the snippet split by new lines, with placeholders per line/character
 * instead of by offset.
 */

import * as Snippets from "vscode-snippet-parser/lib"

export interface OniSnippetPlaceholder {
    index: number

    // Zero-based line relative to the start of the snippet
    line: number

    // Zero-based start character
    character: number

    value: string
}

export const getLineCharacterFromOffset = (offset: number, lines: string[]): { line: number, character: number } => {
    let idx = 0
    let currentOffset = 0
    while (idx < lines.length) {

        if (offset >= currentOffset && offset < currentOffset + lines[idx].length) {
            return { line: idx, character: offset - currentOffset }
        }

        currentOffset += lines[idx].length + 1
        idx++
    }

    return { line: -1, character: - 1}
}

export class OniSnippet {

    private _parser: Snippets.SnippetParser = new Snippets.SnippetParser()

    constructor(
        private _textmateSnippet: Snippets.TextmateSnippet,
    ) {

    }

    public setPlaceholder(index: number, newValue: string): void {

        const snip = this._parser.parse(newValue)
        const placeholderToReplace = this._textmateSnippet.placeholders.filter((p) => p.index === index)

        placeholderToReplace.forEach((rep) => {
            this._textmateSnippet.replace(rep, snip.children)
        })
    }

    public getPlaceholders(): OniSnippetPlaceholder[] {
        const placeholders = this._textmateSnippet.placeholders

        const lines = this.getLines()

        const oniPlaceholders = placeholders.map((p) => {
            const offset = this._textmateSnippet.offset(p)
            const position = getLineCharacterFromOffset(offset, lines)

            return {
                ...position,
                index: p.index,
                value: p.toString(),
            }
        })

        return oniPlaceholders
    }

    public getLines(): string[] {
        const normalizedSnippetString = this._getNormalizedSnippet()

        return normalizedSnippetString.split("\n")
    }

    private _getNormalizedSnippet(): string {
        const snippetString = this._textmateSnippet.toString()
        const normalizedSnippetString = snippetString.replace("\r\n", "\n")

        return normalizedSnippetString
    }
}
