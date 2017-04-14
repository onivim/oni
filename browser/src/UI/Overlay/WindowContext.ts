
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

    public getCurrentScreenLine(): number {
        return this._eventContext.winline
    }

    public getStartScreenLineFromBufferLine(bufferLine: number): number {
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
    /**
     * Returns the amount of columns available for writing (so NOT including the column for eg. line numbers) in the current window/split
     */
    public getColumnsPerScreenLine(): number {
        return this._dimensions.width - this.getColumnOffset()
    }

    /**
     * Returns the current column of the cursor, based on window lines
     * This means that if your columns wrap at 80 and your cursor is on column 90 of a line,
     * this will return 90. This is in contrast to _eventContext.wincol, which would give you 10 + offset
     */
    public getCurrentWindowColumn(): number {
        return this._eventContext.column
    }

    /**
     * Returns the columns on the left side that are "lost" (ie you can't write on them) because of eg. numbers, gutter, ...
     */
    public getColumnOffset(): number {
        const currentLineStartsOnScreenLine = this._lineMapping[this._eventContext.line]
        const currentScreenLine = this._eventContext.winline
        const wrappedLines = currentScreenLine - currentLineStartsOnScreenLine

        // We have two unknown variables: 
        // * the linenumbers column offset, named "offset"
        // * and the amount of columns per line, named "columnsPerScreenLine"
        // The following 2 equations always hold, so we can use these to determine both variables:
        // this._eventContext.column - wrappedLines * columnsPerScreenLine = this._eventContext.wincol - offset
        // offset + columnsPerScreenLine = this._dimensions.width
        // High school algebra then gets us:
        const offset = (this._eventContext.wincol - this._eventContext.column + wrappedLines * this._dimensions.width) / (wrappedLines + 1)
        return offset

        // It would be much easier if we could just ask neovim to give this to say how much the offset is, but I haven't found how so far
    }

    /**
     * Returns position of window line + column in pixels on the screen
     */
    public getWindowPosition(windowline: number, column: number): Rectangle {
        const linePosition = this.getWindowRegionForLine(windowline)

        const columnsPerScreenLine = this.getColumnsPerScreenLine()
        // adding + 1 to columnsPerScreenLine because a page of eg. 85 wraps at 86
        const linesWrapped = Math.floor(column / (columnsPerScreenLine + 1))

        const columnPosition = (column - (linesWrapped * columnsPerScreenLine) + this.getColumnOffset())
        const columnPositionInPixels = (columnPosition - 1) * this._fontWidthInPixels // -1 Because it's more natural to indicate an x coordinate in front of it's cell than after it

        return {
            x: columnPositionInPixels,
            y: linePosition.y + linesWrapped * this._fontHeightInPixels,
            width: this._fontWidthInPixels,
            height: this._fontHeightInPixels,
        }
    }
}
