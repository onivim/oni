import * as msgpack from "./MsgPack"
import { Session } from "./Session"

export interface IBuffer {
    getLines(start: number, end: number, useStrictIndexing: boolean): Promise<string[]>

    setLines(start: number, end: number, useStrictIndexing: boolean, lines: string[]): void
    getLineCount(): Promise<number>
    setOption(optionName: string, optionValue: any): void
    appendLines(lines: string[]): Promise<void>
    clearHighlight(highlightId: number, startLine: number, endLine: number): Promise<void>
    addHighlight(highlightId: number, highlightType: string, line: number, startColumn: number, endColumn: number): Promise<void>

    getMark(mark: string): Promise<Oni.Position>
}

export class Buffer implements IBuffer {

    constructor(
        private _bufferReference: msgpack.NeovimBufferReference,
        private _session: Session,
    ) { }

    public getLineCount(): Promise<number> {
        return this._session.request<number>("nvim_buf_line_count", [this._bufferReference])
    }

    public addHighlight(highlightId: number, highlightType: string, line: number, startColumn: number, endColumn: number): Promise<void> {
        return this._session.request<void>("nvim_buf_add_highlight", [this._bufferReference, highlightId, highlightType, line, startColumn, endColumn])
    }

    public clearHighlight(highlightId: number, startLine: number, endLine: number): Promise<void> {
        return this._session.request<void>("nvim_buf_clear_highlight", [this._bufferReference, highlightId, startLine, endLine])
    }

    public setLines(start: number, end: number, useStrictIndexing: boolean, lines: string[]): Promise<void> {
        return this._session.request<void>("nvim_buf_set_lines", [this._bufferReference, start, end, useStrictIndexing, lines])
    }

    public getLines(start: number, end: number, useStrictIndexing: boolean): Promise<string[]> {
        return this._session.request<string[]>("nvim_buf_get_lines", [this._bufferReference, start, end, useStrictIndexing])
    }

    public setOption(optionName: string, optionValue: any): Promise<void> {
        return this._session.request<void>("nvim_buf_set_option", [this._bufferReference, optionName, optionValue])
    }

    public getMark(mark: string): Promise<{ line: number; column: number }> {
        return this._session.request<number[]>("nvim_buf_get_mark", [this._bufferReference, mark])
            .then((pos: number[]) => ({
                line: pos[0],
                column: pos[1],
            }))
    }

    public async appendLines(lines: string[]): Promise<void> {
        const lineCount = await this.getLineCount()
        return await this._session.request<void>("nvim_buf_set_lines", [this._bufferReference, lineCount, lineCount, true, lines])
    }
}
