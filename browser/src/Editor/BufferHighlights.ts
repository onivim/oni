/**
 * BufferHighlights.ts
 *
 * Helpers to manage buffer highlight state
 */

import * as SyntaxHighlighting from "./../Services/SyntaxHighlighting"

import { NeovimInstance } from "./../neovim"

// Line number to highlight src id, for clearing
export type BufferHighlightId = number

export interface IBufferHighlightsUpdater {
    setHighlightsForLine(line: number, highlights: SyntaxHighlighting.HighlightInfo[]): void
    clearHighlightsForLine(line: number): void
}

// Helper class to efficiently update
// buffer highlights in a batch.
export class BufferHighlightsUpdater implements IBufferHighlightsUpdater {
    private _calls: any[] = []

    constructor(
        private _bufferId: number,
        private _neovimInstance: NeovimInstance,
        private _highlightId: BufferHighlightId,
    ) {}

    public async start(): Promise<void> {
        if (!this._highlightId) {
            this._highlightId = await this._neovimInstance.request<number>(
                "nvim_buf_add_highlight",
                [this._bufferId, 0, "", 0, 0, 0],
            )
        }
    }

    public setHighlightsForLine(
        line: number,
        highlights: SyntaxHighlighting.HighlightInfo[],
    ): void {
        this.clearHighlightsForLine(line)

        if (!highlights || !highlights.length) {
            return
        }

        const addHighlightCalls = highlights.map(hl => {
            const highlightGroup = this._neovimInstance.tokenColorSynchronizer.getHighlightGroupForTokenColor(
                hl.tokenColor,
            )

            return [
                "nvim_buf_add_highlight",
                [
                    this._bufferId,
                    this._highlightId,
                    highlightGroup,
                    hl.range.start.line,
                    hl.range.start.character,
                    hl.range.end.character,
                ],
            ]
        })

        this._calls = this._calls.concat(addHighlightCalls)
    }
    public clearHighlightsForLine(line: number): void {
        this._calls.push([
            "nvim_buf_clear_highlight",
            [this._bufferId, this._highlightId, line, line + 1],
        ])
    }

    public async apply(): Promise<BufferHighlightId> {
        if (this._calls.length > 0) {
            await this._neovimInstance.request<void>("nvim_call_atomic", [this._calls])
        }
        return this._highlightId
    }
}
