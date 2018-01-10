/**
 * Snippets
 *
 * Service managing snippets
 */

import * as types from "vscode-languageserver-types"

// import { Event, IEvent } from "oni-types"
import * as Oni from "oni-api"

import { commandManager } from "./CommandManager"
import { editorManager } from "./EditorManager"

export interface ISnippetStop {
    text: string

    // ranges describe the regions that match
    // the placeholder. These are relative
    // to the snippet
    ranges: types.Range[]
}
export interface ISnippet {
    lines: string[]
    stops: SnippetStops
}

export type SnippetStops = { [key: number]: ISnippetStop }

export const TestSnippet: ISnippet = {
    lines: [
        "snippet-line-1",
        "   snippet-line-2",
        "snippet-line-3",
    ],
    stops: {
        [1]: {
            text: "snippet",
            ranges: [
                types.Range.create(0, 0, 0, 6),
                types.Range.create(1, 3, 1, 9),
                types.Range.create(2, 0, 2, 6),
            ]
        }
    },
}

export const isRangeAfter = (range: types.Range, rangeToTestIfAfter: types.Range): boolean => {
    if (range.start.line === rangeToTestIfAfter.start.line
        && rangeToTestIfAfter.start.character > range.start.character) {
            return true
        }

    return false
}

export const remapRanges = (rangeBeingUpdated: types.Range, delta: number, rangesToUpdate: types.Range[]): types.Range[] => {
    return rangesToUpdate.map((r) => {
        if (isRangeAfter(rangeBeingUpdated, r)) {
            return types.Range.create(r.start.line, r.start.character + delta, r.end.line, r.end.character + delta)
        } else {
            return r
        }
    })
}

export class SnippetManager {

    private _activeSnippet: ISnippet

    private _activeBuffer: Oni.Buffer
    private _insertLine: number

    // When starting a snippet in the middle of the line,
    // we need to keep track of the stuff before/after the
    // snippet insertion point
    // private _linePrefix: string
    // private _lineSuffix: string


    public async startSnippet(buffer: Oni.Buffer, line: number, column: number, snippet?: ISnippet) {

        snippet = snippet || TestSnippet

        this._activeSnippet = snippet
        this._activeBuffer = buffer

        this._insertLine = line

        // const lines = await buffer.getLines(line, line + 1)
        // const lineContents = lines[0]

        // this._linePrefix = ""
        // this._lineSuffix = ""

        await buffer.setLines(line, line + 1, snippet.lines)
    }

    public async setPlaceholderText(id: number, text: string): Promise<void> {
        const lastStop = this._activeSnippet.stops[id]
        const delta = text.length - lastStop.text.length

        let updatedStops = { ...this._activeSnippet.stops }

        lastStop.ranges.forEach((range) => {

            const stopIds = Object.keys(updatedStops)

            stopIds.forEach((key) => {
                let stop = updatedStops[key]

                updatedStops[key] = {
                    text: stop.text,
                    ranges: remapRanges(range, delta, stop.ranges),
                }
            })

        })

        const updatedLines = [ ...this._activeSnippet.lines ]

        lastStop.ranges.forEach((range) => {
            const line = this._activeSnippet.lines[range.start.line]
            const pre = line.substring(0, range.start.character)
            const post = line.substring(range.end.character + 1, line.length)

            updatedLines[range.start.line] = pre + text + post
        })

        const stopsWithNewText: SnippetStops = {
            ...updatedStops,
            [id]: {
                ranges: updatedStops[id].ranges.map((r) => types.Range.create(r.start.line, r.start.character + delta, r.end.line, r.end.character + delta)),
                text: text,
            }
        }

        this._activeSnippet = {
            lines: updatedLines,
            stops: stopsWithNewText,
        }

        const snippet = this._activeSnippet
        await this._activeBuffer.setLines(this._insertLine, this._insertLine + snippet.lines.length, snippet.lines)
    }

}

export const activate = () => {
    const snippetManager = new SnippetManager()
    commandManager.registerCommand({
        command: "snippet.insert",  
        name: null,
        detail: null,
        execute: () => {
            const currentBuffer = editorManager.activeEditor.activeBuffer
            snippetManager.startSnippet(currentBuffer, 0, 0)
        }

    })

    commandManager.registerCommand({
        command: "snippet.update",  
        name: null,
        detail: null,
        execute: (args: string) => {
            snippetManager.setPlaceholderText(1, args)
        }

    })

}
