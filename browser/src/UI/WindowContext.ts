import { IWindowDimensions } from "./../neovim/Window"

import * as State from "./State"
import { Rectangle } from "./Types"

/**
 * These interfaces must be kept in sync with the window_display_update method in init.vim
 */
export interface IWindowMappingData {
    dimensions: IWindowDimensions
    mapping: any
}

export class WindowContext {
    constructor(
        private _fontWidthInPixels: number,
        private _fontHeightInPixels: number,
        private _windowState: State.IWindow) {
    }

    public get dimensions(): Rectangle {
        return this._windowState.dimensions
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

    public get lineToPositionMap(): State.WindowLineMap {
        return this._windowState.lineMapping
    }

    public isLineInView(line: number): boolean {
        return typeof this.lineToPositionMap[line] === "number"
    }

    public getCurrentWindowLine(): number {
        return this._windowState.winline
    }

    public getWindowLine(bufferLine: number): number {
        return this.lineToPositionMap[bufferLine]
    }

    public getWindowRegionForLine(line: number) {
        const screenLine = this.lineToPositionMap[line]
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
        const columnPosition = (this._windowState.wincolumn - this._windowState.column + column - 1) * this._fontWidthInPixels
        return {
            x: linePosition.x + columnPosition,
            y: linePosition.y,
            width: this._fontWidthInPixels,
            height: this._fontHeightInPixels,
        }
    }
}
