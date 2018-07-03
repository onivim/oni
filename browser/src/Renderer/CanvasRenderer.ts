import { Grid } from "./../Grid"
import { ICell, MinimalScreenForRendering } from "./../neovim"
import * as Performance from "./../Performance"
import { INeovimRenderer } from "./INeovimRenderer"
import { getSpansToEdit, IPosition, ISpan } from "./Span"

import { configuration } from "./../Services/Configuration"

export interface IRenderState {
    isWhitespace: boolean
    foregroundColor: string
    backgroundColor: string
    text: string
    startX: number
    bold: boolean
    italic: boolean
    underline: boolean
    y: number
    width: number
}

const isWhiteSpace = (text: string) => text === null || text === "" || text === " "

const cellsAreSameColor = (cell1: ICell, cell2: ICell): boolean => {
    if (!cell1 || !cell2) {
        return false
    }

    return (
        cell1.backgroundColor === cell2.backgroundColor &&
        cell1.foregroundColor === cell2.foregroundColor &&
        cell1.characterWidth === 1 &&
        cell2.characterWidth === 1
    )
}

const cellsAreEqual = (cell1: ICell, cell2: ICell): boolean => {
    if (cell1 === cell2) {
        return true
    }

    if (cellsAreSameColor(cell1, cell2) && cell1.character === cell2.character) {
        return true
    }

    return false
}

export class CanvasRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    private _canvasElement: HTMLCanvasElement
    private _canvasContext: CanvasRenderingContext2D

    private _width: number
    private _height: number

    private _isOpaque: boolean

    private _lastRenderGrid: Grid<ICell> = new Grid<ICell>()
    private _grid: Grid<ISpan> = new Grid<ISpan>()
    private _devicePixelRatio: number

    public start(element: HTMLDivElement): void {
        this._editorElement = element

        this._setContext()
    }

    public onAction(_action: any): void {
        // In the future, something like scrolling could be potentially optimized here
    }

    public redrawAll(screenInfo: MinimalScreenForRendering): void {
        if (!this._editorElement) {
            return
        }

        const cellsToUpdate: IPosition[] = []

        this._setContext()

        if (this._isOpaque) {
            this._canvasContext.fillStyle = screenInfo.backgroundColor
            this._canvasContext.fillRect(0, 0, this._width, this._height)
        } else {
            this._canvasContext.clearRect(0, 0, this._width, this._height)
        }

        this._lastRenderGrid.clear()

        for (let x = 0; x < screenInfo.width; x++) {
            for (let y = 0; y < screenInfo.height; y++) {
                const cell = screenInfo.getCell(x, y)
                cellsToUpdate.push({ x, y })
                this._lastRenderGrid.setCell(x, y, cell)
            }
        }

        this._draw(screenInfo, cellsToUpdate)
    }

    public draw(screenInfo: MinimalScreenForRendering): void {
        if (!this._editorElement) {
            return
        }

        const cellsToUpdate: IPosition[] = []
        for (let x = 0; x < screenInfo.width; x++) {
            for (let y = 0; y < screenInfo.height; y++) {
                const lastCell = this._lastRenderGrid.getCell(x, y)
                const currentCell = screenInfo.getCell(x, y)

                if (!cellsAreEqual(lastCell, currentCell)) {
                    cellsToUpdate.push({ x, y })
                    this._lastRenderGrid.setCell(x, y, currentCell)
                }
            }
        }

        this._draw(screenInfo, cellsToUpdate)
    }

    public _draw(screenInfo: MinimalScreenForRendering, modifiedCells: IPosition[]): void {
        Performance.mark("CanvasRenderer.update.start")

        this._canvasContext.font = `${screenInfo.fontWeight} ${screenInfo.fontSize} ${
            screenInfo.fontFamily
        }`
        this._canvasContext.textBaseline = "top"
        this._canvasContext.setTransform(this._devicePixelRatio, 0, 0, this._devicePixelRatio, 0, 0)
        this._canvasContext.imageSmoothingEnabled = false

        this._editorElement.style.fontFamily = screenInfo.fontFamily
        this._editorElement.style.fontSize = screenInfo.fontSize
        this._editorElement.style.fontWeight = screenInfo.fontWeight

        const rowsToEdit = getSpansToEdit(this._grid, modifiedCells)

        for (const y of Object.keys(rowsToEdit)) {
            const row: ISpan[] = rowsToEdit[y]

            if (!row) {
                return
            }

            row.forEach((span: ISpan) => {
                // All spans that have changed in current rendering pass

                const rowIndex = Number.parseInt(y)

                const currentCell = screenInfo.getCell(span.startX, rowIndex)

                // Check spans before & after, to see if they can be merged
                // (In other words, if they should be re-rendered together)
                // This is important for ligature cases.
                const gridCellBefore = screenInfo.getCell(span.startX - 1, rowIndex)
                const gridCellAfter = screenInfo.getCell(span.endX + 1, rowIndex)

                let updatedStartX = span.startX
                let updatedEndX = span.endX

                if (cellsAreSameColor(currentCell, gridCellBefore)) {
                    const previousCell = this._grid.getCell(span.startX - 1, rowIndex)
                    if (previousCell) {
                        updatedStartX = previousCell.startX
                    }
                }

                if (cellsAreSameColor(currentCell, gridCellAfter)) {
                    const afterCell = this._grid.getCell(span.endX + 1, rowIndex)

                    if (afterCell) {
                        updatedEndX = afterCell.endX
                    }
                }

                const updatedSpan: ISpan = {
                    startX: updatedStartX,
                    endX: updatedEndX,
                }

                this._renderSpan(updatedSpan, rowIndex, screenInfo)
            })
        }

        Performance.mark("CanvasRenderer.update.end")
    }

    private _renderSpan(span: ISpan, y: number, screenInfo: MinimalScreenForRendering): void {
        let prevState: IRenderState = {
            isWhitespace: false,
            foregroundColor: screenInfo.foregroundColor,
            backgroundColor: screenInfo.backgroundColor,
            text: "",
            bold: false,
            italic: false,
            underline: false,
            startX: span.startX,
            y,
            width: 0,
        }

        let x = span.startX
        while (x < span.endX) {
            const cell = screenInfo.getCell(x, y)

            const nextRenderState = this._getNextRenderState(cell, x, y, prevState)

            if (this._isNewState(prevState, nextRenderState)) {
                this._renderText(prevState, screenInfo)
            }

            prevState = nextRenderState

            const increment = nextRenderState.startX + nextRenderState.width
            x = increment
        }

        this._renderText(prevState, screenInfo)
    }

    private _getNextRenderState(
        cell: ICell,
        x: number,
        y: number,
        currentState: IRenderState,
    ): IRenderState {
        const isCurrentCellWhiteSpace = isWhiteSpace(cell.character)
        if (
            cell.foregroundColor !== currentState.foregroundColor ||
            cell.backgroundColor !== currentState.backgroundColor ||
            isCurrentCellWhiteSpace !== currentState.isWhitespace ||
            cell.characterWidth > 1
        ) {
            return {
                isWhitespace: isCurrentCellWhiteSpace,
                foregroundColor: cell.foregroundColor,
                backgroundColor: cell.backgroundColor,
                text: cell.character,
                bold: cell.bold,
                italic: cell.italic,
                underline: cell.underline,
                width: cell.characterWidth,
                startX: x,
                y,
            }
        } else {
            const adjustedCharacterWidth = isCurrentCellWhiteSpace ? 1 : cell.characterWidth

            // Not using spread (...) operator, which would simplify this,
            // because this is a hot-path for rendering and `Object.assign`
            // has some overhead that showed up in the profile.
            return {
                isWhitespace: currentState.isWhitespace,
                foregroundColor: cell.foregroundColor,
                backgroundColor: cell.backgroundColor,
                text: currentState.text + cell.character,
                bold: cell.bold,
                italic: cell.italic,
                underline: cell.underline,
                width: currentState.width + adjustedCharacterWidth,
                startX: currentState.startX,
                y: currentState.y,
            }
        }
    }

    private _isNewState(oldState: IRenderState, newState: IRenderState) {
        return oldState.startX !== newState.startX
    }

    private _renderText(state: IRenderState, screenInfo: MinimalScreenForRendering): void {
        // Spans can have a width of 0 if they are placeholders for cells
        // after a multibyte character. In this case, we don't need to bother
        // rendering or clearing, because that occurs with the multibyte character.
        if (state.width === 0) {
            return
        }

        const { backgroundColor, foregroundColor, bold, italic, text, startX, y } = state

        const { fontWidthInPixels, fontHeightInPixels, linePaddingInPixels } = screenInfo

        const boundsStartX = startX * fontWidthInPixels
        const boundsY = y * fontHeightInPixels
        const boundsWidth = state.width * fontWidthInPixels

        // This normalization is required to fix "cracks" due to anti-aliasing and rendering
        // rectangles on subpixel boundaries. Sometimes, the rectangle will not "connect"
        // between adjacent boundaries, and there is a crack between the blocks. Worse,
        // sometimes when clearing a rectangle, a thin line will be left.
        //
        // This normalization addresses it by making sure the rectangle bounds are aligned
        // to the nearest integer pixel.
        const normalizedBoundsStartX = Math.floor(boundsStartX)
        const delta = boundsStartX - normalizedBoundsStartX
        const normalizedBoundsWidth = Math.ceil(boundsWidth + delta)

        const normalizedBoundsY = Math.floor(boundsY)
        const deltaY = boundsY - normalizedBoundsY
        const normalizedHeight = Math.ceil(boundsY + deltaY)

        this._canvasContext.fillStyle = backgroundColor || screenInfo.backgroundColor

        if (this._isOpaque || (backgroundColor && backgroundColor !== screenInfo.backgroundColor)) {
            this._canvasContext.fillRect(
                normalizedBoundsStartX,
                normalizedHeight,
                normalizedBoundsWidth,
                fontHeightInPixels,
            )
        } else {
            this._canvasContext.clearRect(
                normalizedBoundsStartX,
                normalizedHeight,
                normalizedBoundsWidth,
                fontHeightInPixels,
            )
        }

        if (!state.isWhitespace) {
            const lastFontStyle = this._canvasContext.font
            this._canvasContext.fillStyle = foregroundColor
            if (bold) {
                this._canvasContext.font = `bold ${this._canvasContext.font}`
            }
            if (italic) {
                this._canvasContext.font = `italic ${this._canvasContext.font}`
            }
            this._canvasContext.fillText(
                text,
                boundsStartX,
                normalizedBoundsY + linePaddingInPixels / 2,
            )
            this._canvasContext.font = lastFontStyle
        }

        // Commit span dimensions to grid
        const spanInfoToCommit: ISpan = {
            startX: state.startX,
            endX: state.startX + state.width,
        }

        for (let x = state.startX; x < state.startX + state.width; x++) {
            this._grid.setCell(x, state.y, spanInfoToCommit)
        }
    }

    private _setContext(): void {
        this._editorElement.innerHTML = ""
        this._devicePixelRatio = window.devicePixelRatio

        // offsetWidth and offsetHeight always return an integer
        const editorWidth = this._editorElement.offsetWidth
        const editorHeight = this._editorElement.offsetHeight

        this._canvasElement = document.createElement("canvas")
        this._canvasElement.style.width = editorWidth + "px"
        this._canvasElement.style.height = editorHeight + "px"

        this._editorElement.appendChild(this._canvasElement)

        this._width = this._canvasElement.width = editorWidth * this._devicePixelRatio
        this._height = this._canvasElement.height = editorHeight * this._devicePixelRatio

        if (
            configuration.getValue("editor.backgroundImageUrl") &&
            configuration.getValue("editor.backgroundOpacity") < 1.0
        ) {
            this._canvasContext = this._canvasElement.getContext("2d", { alpha: true })
            this._isOpaque = false
        } else {
            this._canvasContext = this._canvasElement.getContext("2d", { alpha: false })
            this._isOpaque = true
        }
    }
}
