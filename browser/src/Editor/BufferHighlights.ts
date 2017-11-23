/**
 * BufferHighlights.ts
 *
 * Helpers to manage buffer highlight state
 */

import * as SyntaxHighlighting from "./../Services/SyntaxHighlighting"


export type BufferHighlightState = { [key: number]: IBufferHighlightLineState
}

export interface IBufferHighlightLineState {

    // srcId is use for clearing the highlight
    srcId: number

    highlights: SyntaxHighlighting.HighlightInfo[]
}


export interface IClearInfo {
    srcId: number
    line: number
}

export interface IBufferHighlightUpdates {
    linesToClear: IClearInfo[]
    linesToUpdate: number[]
    newState: BufferHighlightState
}

export interface IBufferHighlightUpdater {
    start(state: BufferHighlightState, newSrcId: number): void

    updateHighlight(highlightInfo: SyntaxHighlighting.HighlightInfo): void

    end(): IBufferHighlightUpdates
}

export const doesHighlightAlreadyExist = (highlightInfo: SyntaxHighlighting.HighlightInfo, highlights: SyntaxHighlighting.HighlightInfo[]) => {

    const matchingHighlight = highlights.find((hl) => {
        return hl.highlightGroup === highlightInfo.highlightGroup
            && hl.range.start.line ===  highlightInfo.range.start.line 
            && hl.range.start.character === highlightInfo.range.start.character
            && hl.range.end.line === highlightInfo.range.end.line
            && hl.range.end.character === highlightInfo.range.end.character
    })

    return !!matchingHighlight
}

import * as Utility from "./../Utility"

export const removeOverlappingHighlights = (highlightInfo: SyntaxHighlighting.HighlightInfo, highlights: SyntaxHighlighting.HighlightInfo[]): SyntaxHighlighting.HighlightInfo[] => {
    // TODO: Test this...
    
    return highlights.filter((hl) => {

        // Overlaps start
        if (Utility.isInRange(highlightInfo.range.start.line, highlightInfo.range.start.character, hl.range)) {
            return false
        }

        // Overlaps end
        if (Utility.isInRange(highlightInfo.range.end.line, highlightInfo.range.end.character, hl.range)) {
            return false
        }

        const newRange = highlightInfo.range
        const testRange = hl.range

        if (newRange.start.character <= testRange.start.character &&
            newRange.end.character >= testRange.end.character) {
            return false
        }

        return true
    })
}

export class BufferHighlightUpdater implements IBufferHighlightUpdater {

    private _state: BufferHighlightState
    private _newSrcId: number
    private _linesToUpdate: number[]
    private _linesToClear: IClearInfo[]

    public start(state: BufferHighlightState, newSrcId: number): void {
        this._state = { ...state } || {}
        this._newSrcId = newSrcId
        this._linesToUpdate = []
        this._linesToClear = []
    }

    public updateHighlight(highlightInfo: SyntaxHighlighting.HighlightInfo): void {
        const lineNumber = highlightInfo.range.start.line

        if (!this._state[lineNumber]) {
            this._linesToUpdate.push(lineNumber)
            this._state[lineNumber] = {
                srcId: this._newSrcId,
                highlights: [highlightInfo],
            }

            return
        }

        const currentLine = this._state[lineNumber]

        if (doesHighlightAlreadyExist(highlightInfo, currentLine.highlights)) {
            return
        }

        const newHighlights = removeOverlappingHighlights(highlightInfo, currentLine.highlights)
        newHighlights.push(highlightInfo)

        if (currentLine.srcId !== this._newSrcId) {
            this._linesToClear.push({
                srcId: currentLine.srcId,
                line: lineNumber,
            })
        }

        this._linesToUpdate.push(lineNumber)
        this._state[lineNumber] = {
                srcId: this._newSrcId,
                highlights: newHighlights,
            }
    }

    public end(): IBufferHighlightUpdates {
        return {
            linesToClear: this._linesToClear,
            linesToUpdate: this._linesToUpdate,
            newState: this._state,
        }
    }
}
