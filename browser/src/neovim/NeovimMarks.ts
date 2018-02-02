/**
 * NeovimMarks.ts
 *
 * Strongly typed interface to Neovim's mark functionality
 */

import { Event, IEvent } from "oni-types"

import { NeovimInstance } from "./NeovimInstance"

export interface INeovimMarkInfo {
    mark: string
    global: boolean
    line: number
    column: number
    text: string
}

export interface INeovimMarks {
    onMarksUpdated: IEvent<INeovimMarkInfo[]>

    /**
     * Call to start watching marks. Note that this forces
     * the mappings to the canonical `ma`, etc.
     */
    watchMarks(): void
}

// const parseMarks = (marks: string): INeovimMarkInfo[] => {
//     if (!marks) {
//         return []
//     }

//     const allLines = marks.split("\n")

//     const [empty, header, ...markLines] = allLines

// }

const isWhitespace = (character: string): boolean => /\s/.test(character)

const getNextNonWhitespaceCharacter = (str: string, start: number): number => {
    let idx = start
    while (idx < str.length) {
        if (!isWhitespace(str[idx])) {
            return idx
        }
        idx++
    }

    return -1
}

const getNextWhitespaceCharacter = (str: string, start: number): number => {
    let idx = start
    while (idx < str.length) {
        if (isWhitespace(str[idx])) {
            return idx
        }
        idx++
    }

    return -1
}

const isLowerCase = (str: string) => str.toLowerCase() === str

export const parseMarkLine = (markLine: string): INeovimMarkInfo => {
    const markStartIndex = getNextNonWhitespaceCharacter(markLine, 0)
    const markEndIndex = getNextWhitespaceCharacter(markLine, markStartIndex + 1)

    const lineStartIndex = getNextNonWhitespaceCharacter(markLine, markEndIndex + 1)
    const lineEndIndex = getNextWhitespaceCharacter(markLine, lineStartIndex + 1)

    const columnStartIndex = getNextNonWhitespaceCharacter(markLine, lineEndIndex + 1)
    const columnEndIndex = getNextWhitespaceCharacter(markLine, columnStartIndex + 1)

    const textStartIndex = getNextNonWhitespaceCharacter(markLine, columnEndIndex + 1)

    const mark = markLine.substring(markStartIndex, markEndIndex)
    const lineNumber = parseInt(markLine.substring(lineStartIndex, lineEndIndex))
    const column = parseInt(markLine.substring(columnStartIndex, columnEndIndex))
    const text = markLine.substring(textStartIndex, markLine.length)
    const isGlobal = !isLowerCase(mark)

    return {
        mark,
        line: lineNumber,
        column: column,
        text: text,
        global: isGlobal,
    }
}

export class NeovimMarks {
    private _onMarksUpdatedEvent = new Event<INeovimMarkInfo[]>()

    public get onMarksUpdated(): IEvent<INeovimMarkInfo[]> {
        return this._onMarksUpdatedEvent
    }

    constructor(private _neovimInstance: NeovimInstance) {}

    public watchMarks(): void {
        this._readMarks()
    }

    private async _readMarks(): Promise<INeovimMarkInfo[]> {
        const markInfo = await this._neovimInstance.request("nvim_command_output", [":marks"])

        alert(markInfo)

        return []
    }
}
