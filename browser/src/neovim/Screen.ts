import { Grid } from "./../Grid"
import * as Actions from "./actions"

import { Configuration } from "./../Services/Configuration"

export type Mode = "insert" | "normal" | "visual" | "cmdline_normal"

const wcwidth = require("wcwidth") // tslint:disable-line no-var-requires

export interface IHighlight {
    bold?: boolean
    italic?: boolean
    reverse?: boolean
    underline?: boolean
    undercurl?: boolean

    foregroundColor?: string
    backgroundColor?: string
    isItalicAvailable?: boolean
    isBoldAvailable?: boolean
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
    fontWeight: null | string
    fontWidthInPixels: number
    foregroundColor: string
    height: number
    linePaddingInPixels: number
    mode: string
    width: number
    dispatch(action: Actions.IAction): void
    getCell(x: number, y: number): ICell
    getScrollRegion(): IScrollRegion
}

export interface MinimalScreenForRendering {
    backgroundColor: string
    foregroundColor: string
    width: number
    height: number
    fontFamily: string
    fontSize: string
    fontWeight: null | string
    fontWidthInPixels: number
    fontHeightInPixels: number
    linePaddingInPixels: number
    getCell(x: number, y: number): ICell
}

import { ITypingPrediction } from "./../Services/TypingPredictionManager"

export class ScreenWithPredictions {
    private _predictedRow: number = -1
    private _predictions: { [key: number]: ICell } = {}

    constructor(private _screen: IScreen, private _configuration: Configuration) {}

    public getCell = (x: number, y: number) => {
        if (y === this._predictedRow && this._predictions[x]) {
            return this._predictions[x]
        }

        const cell = this._screen.getCell(x, y)
        return cell
    }

    public updatePredictions(predictions: ITypingPrediction, row: number): void {
        this._predictedRow = row
        this._predictions = {}

        const debugHighlightingPredictions = this._configuration.getValue(
            "debug.showTypingPrediction",
        )
        const predictionBackgroundColor = debugHighlightingPredictions
            ? "red"
            : predictions.backgroundColor
        const predictionForegroundColor = debugHighlightingPredictions
            ? "white"
            : predictions.foregroundColor

        for (let i = 0; i < predictions.predictedCharacters.length; i++) {
            const column =
                predictions.predictedCursorColumn - (predictions.predictedCharacters.length - i)

            const cell: ICell = {
                character: predictions.predictedCharacters[i].character,
                characterWidth: 1,
                backgroundColor: predictionBackgroundColor,
                foregroundColor: predictionForegroundColor,
            }

            this._predictions[column] = cell
        }
    }

    public get linePaddingInPixels(): number {
        return this._screen.linePaddingInPixels
    }

    public get fontFamily(): string {
        return this._screen.fontFamily
    }

    public get fontSize(): string {
        return this._screen.fontSize
    }

    public get backgroundColor(): string {
        return this._screen.backgroundColor
    }

    public get foregroundColor(): string {
        return this._screen.foregroundColor
    }

    public get width(): number {
        return this._screen.width
    }

    public get height(): number {
        return this._screen.height
    }

    public get fontWidthInPixels(): number {
        return this._screen.fontWidthInPixels
    }

    public get fontHeightInPixels(): number {
        return this._screen.fontHeightInPixels
    }

    public get fontWeight(): string {
        return this._screen.fontWeight
    }
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
    italic?: boolean
    bold?: boolean
    underline?: boolean
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

const DefaultCell: ICell = {
    character: "",
    characterWidth: 1,
}

export class NeovimScreen implements IScreen {
    private _backgroundColor: string = "#000000"
    private _currentHighlight: IHighlight = {}
    private _cursorColumn: number = 0
    private _cursorRow: number = 0
    private _fontFamily: null | string = null
    private _fontHeightInPixels: number
    private _fontSize: null | string = null
    private _fontWeight: null | string = null
    private _fontWidthInPixels: number
    private _foregroundColor: string = "#000000"
    private _grid: Grid<ICell> = new Grid<ICell>()
    private _height: number = 40
    private _mode: Mode = "normal"
    private _scrollRegion: IScrollRegion
    private _width: number = 80
    private _linePaddingInPixels: number

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

    public get fontWeight(): null | string {
        return this._fontWeight
    }

    public get fontWidthInPixels(): number {
        return this._fontWidthInPixels
    }

    public get fontHeightInPixels(): number {
        return this._fontHeightInPixels
    }

    public get linePaddingInPixels(): number {
        return this._linePaddingInPixels
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
        return this._currentHighlight.foregroundColor || this._foregroundColor
    }

    public get currentBackgroundColor(): string {
        return this._currentHighlight.backgroundColor || this._backgroundColor
    }

    public getCell = (x: number, y: number) => {
        const cell = this._grid.getCell(x, y)

        if (cell) {
            return cell
        } else {
            return DefaultCell
        }
    }

    public dispatch(action: any): void {
        switch (action.type) {
            case Actions.CursorGotoType:
                this._cursorRow = action.row
                this._cursorColumn = action.col
                break
            case Actions.PutAction: {
                let foregroundColor =
                    this._currentHighlight.foregroundColor || this._foregroundColor
                let backgroundColor =
                    this._currentHighlight.backgroundColor || this._backgroundColor

                if (this._currentHighlight.reverse) {
                    const temp = foregroundColor
                    foregroundColor = backgroundColor
                    backgroundColor = temp
                }

                const { underline, bold, italic } = this._currentHighlight

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
                        italic,
                        bold,
                        underline,
                    })

                    for (let c = 1; c < characterWidth; c++) {
                        this._setCell(col + i + c, row, {
                            foregroundColor,
                            backgroundColor,
                            character: "",
                            characterWidth: 0,
                            italic,
                            bold,
                            underline,
                        })
                    }

                    i += characterWidth - 1
                }

                this._cursorColumn += characters.length
                break
            }
            case Actions.CLEAR_TO_END_OF_LINE: {
                const foregroundColor =
                    this._currentHighlight.foregroundColor || this._foregroundColor
                const backgroundColor =
                    this._currentHighlight.backgroundColor || this._backgroundColor

                const row = this._cursorRow
                for (let i = this._cursorColumn; i < this.width; i++) {
                    this._setCell(i, row, {
                        foregroundColor,
                        backgroundColor,
                        character: "",
                        characterWidth: 1,
                        bold: this._currentHighlight.bold,
                        italic: this._currentHighlight.italic,
                        underline: this._currentHighlight.underline,
                    })
                }
                break
            }
            case Actions.CLEAR:
                this._grid.clear()

                this._cursorColumn = 0
                this._cursorRow = 0
                break
            case Actions.RESIZE:
                this._width = action.columns
                this._height = action.rows
                break
            case Actions.SET_FONT:
                this._fontFamily = action.fontFamily
                this._fontSize = action.fontSize
                this._fontWeight = action.fontWeight
                this._fontWidthInPixels = action.fontWidthInPixels
                this._fontHeightInPixels = action.fontHeightInPixels
                this._linePaddingInPixels = action.linePaddingInPixels
                this._currentHighlight.isItalicAvailable = action.isItalicAvailable
                this._currentHighlight.isBoldAvailable = action.isBoldAvailable
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
                const { isBoldAvailable, isItalicAvailable } = this._currentHighlight
                this._currentHighlight.foregroundColor = action.foregroundColor
                this._currentHighlight.backgroundColor = action.backgroundColor
                this._currentHighlight.reverse = !!action.reverse
                this._currentHighlight.bold = isBoldAvailable ? action.bold : false
                this._currentHighlight.italic = isItalicAvailable ? action.italic : false
                this._currentHighlight.undercurl = action.undercurl
                this._currentHighlight.underline = action.underline
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
            if (
                currentCell.foregroundColor === cell.foregroundColor &&
                currentCell.backgroundColor === cell.backgroundColor &&
                currentCell.character === cell.character
            ) {
                return
            }
        }

        this._grid.setCell(x, y, cell)
    }
}
