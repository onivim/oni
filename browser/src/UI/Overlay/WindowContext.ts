
import { Rectangle } from "./../Types"

import { IWindowDimensions } from "./../../neovim/Window"

/**
 * These interfaces must be kept in sync with the window_display_update method in init.vim
 */
export interface IWindowMappingData {
    dimensions: IWindowDimensions
    mapping: any
}

export class WindowContext {
    private _fontHeightInPixels: number
    private _fontWidthInPixels: number
    private _lineMapping: any
    private _dimensions: IWindowDimensions
    private _eventContext: Oni.EventContext

    constructor(lineMapping: any, dimensions: IWindowDimensions, fontWidthInPixels: number, fontHeightInPixels: number, lastEventContext: Oni.EventContext) {
        this._fontHeightInPixels = fontHeightInPixels
        this._fontWidthInPixels = fontWidthInPixels
        this._dimensions = dimensions
        this._lineMapping = lineMapping
        this._eventContext = lastEventContext
    }

    public get dimensions(): IWindowDimensions {
        return this._dimensions
    }

    public get startLine(): number {
        return -1 // TODO
    }

    public get endLine(): number {
        return -1 // TODO
    }

    public get lineCount(): number {
        return -1 // TODO
    }

    public get fontHeightInPixels(): number {
        return this._fontHeightInPixels
    }

    public get fontWidthInPixels(): number {
        return this._fontWidthInPixels
    }

    public get lineToPositionMap(): string {
        return this._lineMapping
    }

    public isLineInView(line: number): boolean {
        return typeof this._lineMapping[line] === "number"
    }

    public getCurrentWindowLine(): number {
        return this._eventContext.winline
    }

    public getWindowLine(bufferLine: number): number {
        return this._lineMapping[bufferLine]
    }

    public getWindowRegionForLine(line: number) {
        const screenLine = this._lineMapping[line]
        const y = (screenLine - 1) * this._fontHeightInPixels
        return {
            x: 0, // TODO
            y,
            width: 0, // TODO
            height: this._fontHeightInPixels, // TODO
        }
    }

    public getWindowPosition(line: number, column: number): Rectangle {
        const linePosition = this.getWindowRegionForLine(line)
        const columnPosition = (this._eventContext.wincol - this._eventContext.column + column - 1) * this._fontWidthInPixels
        return {
            x: linePosition.x + columnPosition,
            y: linePosition.y,
            width: this._fontWidthInPixels,
            height: this._fontHeightInPixels,
        }
    }
}
