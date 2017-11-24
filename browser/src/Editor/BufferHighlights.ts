/**
 * BufferHighlights.ts
 *
 * Helpers to manage buffer highlight state
 */

import * as SyntaxHighlighting from "./../Services/SyntaxHighlighting"

import * as flatten from "lodash/flatten"

import { NeovimInstance } from "./../neovim"

export type BufferHighlightState = { [key: number]: IBufferHighlightLineState }

// Line number to highlight src id, for clearing
export type BufferHighlightState2 = { [key: number]: number }

export interface IBufferHighlightLineState {

    // srcId is use for clearing the highlight
    srcId: number

    highlights: SyntaxHighlighting.HighlightInfo[]
}


export interface IClearInfo {
    srcId: number
    line: number
}

export const getAtomicCallsForClearedLines = (bufferId: number, clearedLines: IClearInfo[]): any[] => {
    return clearedLines.map((cl) => {
        return ["nvim_buf_clear_highlight", [bufferId, cl.srcId, cl.line, cl.line + 1]]
    })
}


export interface IBufferHighlightsUpdater2 {
    setHighlightsForLine(line: number, highlights: SyntaxHighlighting.HighlightInfo[]): void
    clearHighlightsForLine(line: number): void
}

export class BufferHighlightsUpdater2 implements IBufferHighlightsUpdater2 {

    private _newSrcId: number
    private _calls: any[] = []
    private _newState: BufferHighlightState2

    constructor(
        private _bufferId: number,
        private _neovimInstance: NeovimInstance,
        private _previousState: BufferHighlightState2,
    ) {}

    public async start(): Promise<void> {
        this._newState = {
            ...this._previousState
        }

        this._newSrcId = await this._neovimInstance.request<number>("nvim_buf_add_highlight", [this._bufferId, 0, "", 0, 0, 0])
    }

    public setHighlightsForLine(line: number, highlights: SyntaxHighlighting.HighlightInfo[]): void {
        this.clearHighlightsForLine(line)

        if (!highlights || !highlights.length) {
            return
        }

        const addHighlightCalls = highlights.map((hl) => {
            return ["nvim_buf_add_highlight", [this._bufferId, this._newSrcId, hl.highlightGroup,
                hl.range.start.line, hl.range.start.character, hl.range.end.character]]
        })

        this._newState[line] = this._newSrcId

        this._calls = this._calls.concat(addHighlightCalls)
    }
    public clearHighlightsForLine(line: number): void {
        const previousLine = this._previousState[line]

        if (!previousLine) {
            return
        }

        const oldSrcId = this._previousState[line]
        this._newState[line] = null

        this._calls.push(["nvim_buf_clear_highlight", [this._bufferId, oldSrcId, line, line + 1]])
    }

    public async apply(): Promise<BufferHighlightState2> {
        await this._neovimInstance.request<void>("nvim_call_atomic", [this._calls])
        return this._newState
    }

}

export const getAtomicCallsForUpdatedLines = (bufferId: number, linesToUpdate: number[], newState: BufferHighlightState): any[] => {

    const ret = linesToUpdate.map((ltu) => {
        const srcId = newState[ltu].srcId
        const tokens = newState[ltu].highlights

        return tokens.map((val) => {
            return ["nvim_buf_add_highlight", [bufferId, srcId, val.highlightGroup, val.range.start.line, val.range.start.character, val.range.end.character]]
        })
    })

    return flatten(ret)
}

export const setHighlightsFromResult = async (bufferId: number, neovimInstance: NeovimInstance, result: IBufferHighlightUpdates): Promise<void> => {

    // const clearCalls = getAtomicCallsForClearedLines(bufferId, result.linesToClear)
    const updateCalls = getAtomicCallsForUpdatedLines(bufferId, result.linesToUpdate, result.newState)

    const allCalls = [
        // ...clearCalls,
        ...updateCalls
    ]

    return neovimInstance.request<void>("nvim_call_atomic", [allCalls])
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

            if (this._linesToUpdate.indexOf(lineNumber) === -1) {
                this._linesToUpdate.push(lineNumber)
            }

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

        if (this._linesToUpdate.indexOf(lineNumber) === -1) {
            this._linesToUpdate.push(lineNumber)
        }

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
