/**
 * OniSnippet.ts
 *
 * Wrapper around `TextmateSnippet`. There are some differences in behavior
 * due to differences in editor behavior, for Oni/Neovim, we need to
 * get the snippet split by new lines, with placeholders per line/character
 * instead of by offset.
 */

import * as Snippets from "vscode-snippet-parser/lib"
import { normalizeNewLines } from "./../../Utility"

export type OniVariableResolver = Snippets.VariableResolver

export interface OniSnippetPlaceholder {
    index: number

    // Zero-based line relative to the start of the snippet
    line: number

    // Zero-based start character
    character: number

    value: string
}

export const getLineCharacterFromOffset = (
    offset: number,
    lines: string[],
): { line: number; character: number } => {
    let idx = 0
    let currentOffset = 0
    while (idx < lines.length) {
        if (offset >= currentOffset && offset <= currentOffset + lines[idx].length) {
            return { line: idx, character: offset - currentOffset }
        }

        currentOffset += lines[idx].length + 1
        idx++
    }

    return { line: -1, character: -1 }
}

export class OniSnippet {
    private _parser: Snippets.SnippetParser = new Snippets.SnippetParser()
    private _placeholderValues: { [index: number]: string } = {}
    private _snippetString: string

    constructor(snippet: string, private _variableResolver?: OniVariableResolver) {
        this._snippetString = normalizeNewLines(snippet)
    }

    public setPlaceholder(index: number, newValue: string): void {
        this._placeholderValues[index] = newValue
    }

    public getPlaceholderValue(index: number): string {
        return this._placeholderValues[index] || ""
    }

    public getPlaceholders(): OniSnippetPlaceholder[] {
        const snippet = this._getSnippetWithFilledPlaceholders()
        const placeholders = snippet.placeholders

        const lines = this.getLines()

        const oniPlaceholders = placeholders.map(p => {
            const offset = snippet.offset(p)
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

    private _getSnippetWithFilledPlaceholders(): Snippets.TextmateSnippet {
        const snippet = this._parser.parse(this._snippetString)

        if (this._variableResolver) {
            snippet.resolveVariables(this._variableResolver)
        }

        Object.keys(this._placeholderValues).forEach((key: string) => {
            const val = this._placeholderValues[key]
            const snip = this._parser.parse(val)

            const placeholderToReplace = snippet.placeholders.filter(
                p => p.index.toString() === key,
            )

            placeholderToReplace.forEach(rep => {
                const placeHolder = new Snippets.Placeholder(rep.index)
                placeHolder.appendChild(snip)
                snippet.replace(rep, [placeHolder])
            })
        })

        return snippet
    }

    private _getNormalizedSnippet(): string {
        const snippetString = this._getSnippetWithFilledPlaceholders().toString()
        const normalizedSnippetString = snippetString.replace("\r\n", "\n")

        return normalizedSnippetString
    }
}
