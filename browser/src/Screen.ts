import * as Actions from "./actions"
import { IDeltaRegionTracker } from "./DeltaRegionTracker"
import { Grid } from "./Grid"

export type Mode = "insert" | "normal"

const wcwidth = require("wcwidth") // tslint:disable-line no-var-requires

export interface IHighlight {
    bold?: boolean
    italic?: boolean
    reverse?: boolean
    underline?: boolean
    undercurl?: boolean

    foregroundColor?: string
    backgroundColor?: string
}

export interface IScreen {
    backgroundColor: string
    currentBackgroundColor: string
    currentForegroundColor: string
    cursorColumn: number
    cursorRow: number
    fontFamily: null | string
    fontHeightInPixels: number
    fontSize: null | string
    fontWidthInPixels: number
    foregroundColor: string
    height: number
    mode: string
    width: number
    dispatch(action: Actions.IAction): void
    getCell(x: number, y: number): ICell
    getScrollRegion(): IScrollRegion
}

export interface ICell {
    character: string

    /**
     * Specify the width of the character. Some Unicode characters will take up multiple
     * cells, like `한`, which needs to be accounted for in rendering.
     */
    characterWidth: number

    foregroundColor?: string
    backgroundColor?: string
}

export interface IPixelPosition {
    x: number
    y: number
}

export interface IPosition {
    row: number
    column: number
}

export interface IScrollRegion {
    top: number
    bottom: number
    left: number
    right: number
}

export class NeovimScreen implements IScreen {
    private _backgroundColor: string = "#000000"
    private _currentHighlight: IHighlight = {}
    private _cursorColumn: number = 0
    private _cursorRow: number = 0
    private _deltaTracker: IDeltaRegionTracker
    private _fontFamily: null | string = null
    private _fontHeightInPixels: number
    private _fontSize: null | string = null
    private _fontWidthInPixels: number
    private _foregroundColor: string = "#00FF00"
    private _grid: Grid<ICell> = new Grid<ICell>()
    private _height: number = 40
    private _mode: Mode = "normal"
    private _scrollRegion: IScrollRegion
    private _width: number = 80

    constructor(deltaTracker: IDeltaRegionTracker) {
        this._deltaTracker = deltaTracker
    }

    public get width(): number {
        return this._width
    }

    public get height(): number {
        return this._height
    }

    public get fontFamily(): null | string {
        return this._fontFamily
    }

    public get fontSize(): null | string {
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

    public get currentForegroundColor(): string {
        return this._currentHighlight.foregroundColor ? this._currentHighlight.foregroundColor : this._foregroundColor
    }

    public get currentBackgroundColor(): string {
        return this._currentHighlight.backgroundColor ? this._currentHighlight.backgroundColor : this._backgroundColor
    }

    public getCell(x: number, y: number): ICell {
        const defaultCell = {
            character: "",
            characterWidth: 1,
        }

        const cell = this._grid.getCell(x, y)

        if (cell) {
            return cell
        } else {
            return defaultCell
        }
    }

    public dispatch(action: any): void {
        switch (action.type) {
            case Actions.CursorGotoType:
                this._cursorRow = action.row
                this._cursorColumn = action.col
                break
            case Actions.PutAction: {
                let foregroundColor = this._currentHighlight.foregroundColor ? this._currentHighlight.foregroundColor : this._foregroundColor
                let backgroundColor = this._currentHighlight.backgroundColor ? this._currentHighlight.backgroundColor : this._backgroundColor

                if (this._currentHighlight.reverse) {
                    const temp = foregroundColor
                    foregroundColor = backgroundColor
                    backgroundColor = temp
                }

                const characters = action.characters
                const row = this._cursorRow
                const col = this._cursorColumn

                for (let i = 0; i < characters.length; i++) {
                    const character = characters[i]

                    const characterWidth = Math.max(wcwidth(character), 1)

                    this._setCell(col + i, row, {
                        foregroundColor,
                        backgroundColor,
                        character,
                        characterWidth,
                    })

                    for (let c = 1; c < characterWidth; c++) {
                        this._setCell(col + i + c, row, {
                            foregroundColor,
                            backgroundColor,
                            character: "",
                            characterWidth: 0,
                        })
                    }

                    i += characterWidth - 1
                }

                this._cursorColumn += characters.length
                break
            }
            case Actions.CLEAR_TO_END_OF_LINE: {
                const foregroundColor = this._currentHighlight.foregroundColor ? this._currentHighlight.foregroundColor : this._foregroundColor
                const backgroundColor = this._currentHighlight.backgroundColor ? this._currentHighlight.backgroundColor : this._backgroundColor

                const row = this._cursorRow
                for (let i = this._cursorColumn; i < this.width; i++) {
                    this._setCell(i, row, {
                        foregroundColor,
                        backgroundColor,
                        character: "",
                        characterWidth: 1,
                    })
                }
                break
            }
            case Actions.CLEAR:
                this._grid.clear()
                this._notifyAllCellsModified()

                this._cursorColumn = 0
                this._cursorRow = 0
                break
            case Actions.RESIZE:
                this._width = action.columns
                this._height = action.rows
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
                    right: action.right,
                }
                break
            case Actions.SCROLL: {
                const { top, bottom, left, right } = this.getScrollRegion()
                const count = action.scroll

                const width = right - left
                const height = bottom - top
                const regionToScroll = this._grid.cloneRegion(left, top, width + 1, height + 1)

                regionToScroll.shiftRows(count)

                this._grid.setRegionFromGrid(regionToScroll, left, top)

                for (let y = top; y <= bottom; y++) {
                    for (let x = left; x <= right; x++) {
                        this._deltaTracker.notifyCellModified(x, y)
                    }
                }

                break
            }
            default:
                break
        }
    }

    public getScrollRegion(): IScrollRegion {
        if (this._scrollRegion) {
            return this._scrollRegion
        } else {
            return {
                top: 0,
                bottom: this.height,
                left: 0,
                right: this.width,
            }
        }
    }

    private _setCell(x: number, y: number, cell: ICell): void {
        const currentCell = this._grid.getCell(x, y)
        if (currentCell) {
            if (currentCell.foregroundColor === cell.foregroundColor &&
                currentCell.backgroundColor === cell.backgroundColor &&
                currentCell.character === cell.character) {
                return
            }
        }

        this._deltaTracker.notifyCellModified(x, y)
        this._grid.setCell(x, y, cell)
    }

    private _notifyAllCellsModified(): void {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this._deltaTracker.notifyCellModified(x, y)
            }
        }
    }
}
