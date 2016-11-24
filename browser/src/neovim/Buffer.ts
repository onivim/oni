import * as Q from "q";

export interface IBuffer {
    setLines(start: number, end: number, useStrictIndexing: boolean, lines: string[]): void
    getLineCount(): Q.Promise<number>
    setOption(optionName: string, optionValue: any)
    appendLines(lines: string[])
}

export class Buffer implements IBuffer {
    private _bufferInstance: any

    constructor(bufferInstance: any) {
        this._bufferInstance = bufferInstance
    }

    public getLineCount(): Q.Promise<number> {
        return Q.ninvoke<number>(this._bufferInstance, "lineCount")
    }

    public setLines(start: number, end: number, useStrictIndexing: boolean, lines: string[]) {
        return Q.ninvoke(this._bufferInstance, "setLines", start, end, useStrictIndexing, lines)
    }

    public setOption(optionName: string, optionValue: any) {
        return Q.ninvoke(this._bufferInstance, "setOption", optionName, optionValue)
    }

    public appendLines(lines: string[]) {
        return this.getLineCount()
            .then(lineCount => {
                return Q.ninvoke(this._bufferInstance, "setLines", lineCount, lineCount, true, lines)
            })
    }
}
