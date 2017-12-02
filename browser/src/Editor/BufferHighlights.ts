/**
 * BufferHighlights.ts
 *
 * Helpers to manage buffer highlight state
 */

import * as SyntaxHighlighting from "./../Services/SyntaxHighlighting"

import { NeovimInstance } from "./../neovim"

// Line number to highlight src id, for clearing
export type HighlightSourceId = number
export interface BufferHighlightState { [key: number]: HighlightSourceId }

export interface IBufferHighlightsUpdater {
    setHighlightsForLine(line: number, highlights: SyntaxHighlighting.HighlightInfo[]): void
    clearHighlightsForLine(line: number): void
}

// Helper class to efficiently update
// buffer highlights in a batch.
export class BufferHighlightsUpdater implements IBufferHighlightsUpdater {

    private _newSrcId: number
    private _calls: any[] = []
    private _newState: BufferHighlightState

    constructor(
        private _bufferId: number,
        private _neovimInstance: NeovimInstance,
        private _previousState: BufferHighlightState,
    ) {}

    public async start(): Promise<void> {
        this._newState = {
            ...this._previousState,
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

    public async apply(): Promise<BufferHighlightState> {
        if (this._calls.length > 0) {
            await this._neovimInstance.request<void>("nvim_call_atomic", [this._calls])
        }
        return this._newState
    }
}
