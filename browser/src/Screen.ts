import * as Actions from "./actions"
import { Grid } from "./Grid"
import { DeltaRegionTracker } from "./DeltaRegionTracker"

export type Mode = "insert" | "normal";

export interface Highlight {
    bold?: boolean
    italic?: boolean
    reverse?: boolean
    underline?: boolean
    undercurl?: boolean

    foregroundColor?: string
    backgroundColor?: string
}

export interface Screen {
    width: number;
    height: number;

    fontFamily: string;
    fontSize: string;
    fontWidthInPixels: number;
    fontHeightInPixels: number;

    getCell(x: number, y: number): Cell;
    dispatch(action: Actions.Action): void;

    cursorRow: number;
    cursorColumn: number;
    mode: string;

    backgroundColor: string
    foregroundColor: string
}

export interface Cell {
    character: string;
    foregroundColor?: string;
    backgroundColor?: string;
}

export interface PixelPosition {
    x: number;
    y: number;
}

export interface Position {
    row: number;
    column: number;
}

export interface ScrollRegion {
    top: number
    bottom: number
    left: number
    right: number
}

export class NeovimScreen implements Screen {

    private _cursorRow: number = 0
    private _cursorColumn: number = 0
    private _width: number = 80;
    private _height: number = 40;

    private _grid: Grid<Cell> = new Grid<Cell>()

    private _fontFamily: string = null;
    private _fontSize: string = null;
    private _fontWidthInPixels: number;
    private _fontHeightInPixels: number;
    
    private _mode: Mode = "normal";
    private _backgroundColor: string = "#000000"
    private _foregroundColor: string = "#00FF00"

    private _currentHighlight: Highlight = {};

    private _scrollRegion: ScrollRegion;

    private _deltaTracker: DeltaRegionTracker;

    constructor(deltaTracker: DeltaRegionTracker) {
        this._deltaTracker = deltaTracker
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get fontFamily(): string {
        return this._fontFamily
    }

    public get fontSize(): string {
        return this._fontSize
    }

    public get fontWidthInPixels(): number {
        return this._fontWidthInPixels
    }

    public get fontHeightInPixels(): number {
        return this._fontHeightInPixels
    }

    public get cursorRow(): number {
        return this._cursorRow
    }

    public get cursorColumn(): number {
        return this._cursorColumn
    }

    public get mode(): Mode {
        return this._mode
    }

    public get backgroundColor(): string {
        return this._backgroundColor
    }

    public get foregroundColor(): string {
        return this._foregroundColor
    }

    public getCell(x: number, y: number): Cell {


        var defaultCell = {
            character: ""
        }

        var cell = this._grid.getCell(x, y)

        if (cell)
            return cell
        else
            return defaultCell
    }

    private _setCell(x: number, y: number, cell: Cell): void {

        const currentCell = this._grid.getCell(x, y);

        if(currentCell) {
            if(currentCell.foregroundColor === cell.foregroundColor
                && currentCell.backgroundColor === cell.backgroundColor
                && currentCell.character === cell.character)
                return;
        }

        this._deltaTracker.notifyCellModified(x, y)
        this._grid.setCell(x, y, cell)
    }

    public dispatch(action: any): void {
        switch(action.type) {
            case Actions.CursorGotoType:
                this._cursorRow = action.row
                this._cursorColumn = action.col
                break;
            case Actions.PutAction:

                var foregroundColor = this._currentHighlight.foregroundColor ? this._currentHighlight.foregroundColor : this._foregroundColor
                var backgroundColor = this._currentHighlight.backgroundColor ? this._currentHighlight.backgroundColor : this._backgroundColor

				if (this._currentHighlight.reverse) {
					var temp = foregroundColor;
					foregroundColor = backgroundColor
					backgroundColor = foregroundColor
				}

                var characters = action.characters

                var row = this._cursorRow
                var col = this._cursorColumn

                for(let i = 0; i < characters.length; i++) {
                    this._setCell(col + i, row, {
                        foregroundColor: foregroundColor,
                        backgroundColor: backgroundColor,
                        character: characters[i]
                    })
                }

                this._cursorColumn += characters.length
                break;
            case Actions.CLEAR_TO_END_OF_LINE:
                var foregroundColor = this._currentHighlight.foregroundColor ? this._currentHighlight.foregroundColor : this._foregroundColor
                var backgroundColor = this._currentHighlight.backgroundColor ? this._currentHighlight.backgroundColor : this._backgroundColor

                var row = this._cursorRow
                for(let i = this._cursorColumn; i < this.width; i++) {
                    this._setCell(i, row, {
                        foregroundColor: foregroundColor,
                        backgroundColor: backgroundColor,
                        character: ""
                    })
                }
                break
            case Actions.CLEAR:
                this._grid.clear()
                this._notifyAllCellsModified()
                break
            case Actions.RESIZE:
                this._width = action.columns;
                this._height = action.rows;
                this._notifyAllCellsModified()
                break
            case Actions.SET_FONT:
                this._fontFamily = action.fontFamily
                this._fontSize = action.fontSize
                this._fontWidthInPixels = action.fontWidthInPixels
                this._fontHeightInPixels = action.fontHeightInPixels
                break
            case Actions.CHANGE_MODE:
                this._mode = action.mode
                break
            case Actions.UPDATE_BG:
                this._backgroundColor = action.color
                break
            case Actions.UPDATE_FG:
                this._foregroundColor = action.color
                break
            case Actions.SET_HIGHLIGHT:
                this._currentHighlight.foregroundColor = action.foregroundColor
                this._currentHighlight.backgroundColor = action.backgroundColor
				this._currentHighlight.reverse = !!action.reverse
                break
            case Actions.SET_SCROLL_REGION:
                this._scrollRegion = {
                    top: action.top,
                    bottom: action.bottom,
                    left: action.left,
                    right: action.right
                }
                break
            case Actions.SCROLL:
                const {top, bottom, left, right} = this._getScrollRegion()
                const count = action.scroll

                var width = right - left;
                var height = bottom - top;
                var regionToScroll = this._grid.cloneRegion(left, top, width + 1, height + 1)

                regionToScroll.shiftRows(count, {
                    character: ""
                })

                this._grid.setRegionFromGrid(regionToScroll, left, top)
                this._notifyAllCellsModified()
                break
        }
    }

    private _notifyAllCellsModified(): void {
        for(var x = 0; x < this.width; x++) {
            for(var y = 0; y < this.height; y++) {
                this._deltaTracker.notifyCellModified(x, y)
            }
        }
    }

    private _getScrollRegion(): ScrollRegion {
        if(this._scrollRegion)
            return this._scrollRegion;
        else
            return {
                top: 0,
                bottom: this.height,
                left: 0,
                right: this.width

            }
    }

}
