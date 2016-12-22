import * as Q from "q"

export interface IBuffer {
    getLines(start: number, end: number, useStrictIndexing: boolean): Q.Promise<string[]>

    setLines(start: number, end: number, useStrictIndexing: boolean, lines: string[]): void
    getLineCount(): Q.Promise<number>
    setOption(optionName: string, optionValue: any): void
    appendLines(lines: string[]): Q.Promise<void>
    clearHighlight(highlightId: number, startLine: number, endLine: number): Q.Promise<void>
    addHighlight(highlightId: number, highlightType: string, line: number, startColumn: number, endColumn: number): Q.Promise<void>

    getMark(mark: string): Q.Promise<Oni.Position>
}

export class Buffer implements IBuffer {
    private _bufferInstance: any

    constructor(bufferInstance: any) {
        this._bufferInstance = bufferInstance
    }

    public getLineCount(): Q.Promise<number> {
        return Q.ninvoke<number>(this._bufferInstance, "lineCount")
    }

    public addHighlight(highlightId: number, highlightType: string, line: number, startColumn: number, endColumn: number): Q.Promise<void> {
        return Q.ninvoke<void>(this._bufferInstance, "addHighlight", highlightId, highlightType, line, startColumn, endColumn)
    }

    public clearHighlight(highlightId: number, startLine: number, endLine: number): Q.Promise<void> {
        return Q.ninvoke<void>(this._bufferInstance, "clearHighlight", highlightId, startLine, endLine)
    }

    public setLines(start: number, end: number, useStrictIndexing: boolean, lines: string[]): Q.Promise<{}> {
        return Q.ninvoke(this._bufferInstance, "setLines", start, end, useStrictIndexing, lines)
    }

    public getLines(start: number, end: number, useStrictIndexing: boolean): Q.Promise<string[]> {
        return Q.ninvoke<string[]>(this._bufferInstance, "getLines", start, end, useStrictIndexing)
    }

    public setOption(optionName: string, optionValue: any): Q.Promise<{}> {
        return Q.ninvoke(this._bufferInstance, "setOption", optionName, optionValue)
    }

    public getMark(mark: string): Q.Promise<{ line: number; column: number }> {
        return Q.ninvoke(this._bufferInstance, "getMark", mark)
            .then((pos) => ({
                line: pos[0],
                column: pos[1],
            }))
    }

    public appendLines(lines: string[]): Q.Promise<void> {
        return this.getLineCount()
            .then((lineCount) => {
                return Q.ninvoke<void>(this._bufferInstance, "setLines", lineCount, lineCount, true, lines)
            })
    }
}
