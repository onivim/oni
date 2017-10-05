import { IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import * as Performance from "./../Performance"
import { ICell, IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

import { getSpansToEdit, ISpan } from "./Span"

export interface IRenderState {
    isWhitespace: boolean
    foregroundColor: string
    backgroundColor: string
    text: string
    startX: number
    y: number
    width: number
}

const isWhiteSpace = (text: string) => text === null || text === "" || text === " "

const cellsAreTheSame = (cell1: ICell, cell2: ICell): boolean => {
    if (!cell1 || !cell2) {
        return false
    }

    return cell1.backgroundColor === cell2.backgroundColor
        && cell1.foregroundColor === cell2.foregroundColor
        && cell1.characterWidth === 1 && cell2.characterWidth === 1
}

export class CanvasRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    private _canvasElement: HTMLCanvasElement
    private _canvasContext: CanvasRenderingContext2D
    private _grid: Grid<ISpan> = new Grid<ISpan>()

    private _devicePixelRatio: number

    public start(element: HTMLDivElement): void {
        this._editorElement = element

        this._canvasElement = document.createElement("canvas")
        this._canvasElement.style.width = "100%"
        this._canvasElement.style.height = "100%"

        this._devicePixelRatio = window.devicePixelRatio
        this._canvasContext = this._canvasElement.getContext("2d")

        this._editorElement.appendChild(this._canvasElement)

        this._setContextDimensions()
    }

    public onAction(_action: any): void {
        // In the future, something like scrolling could be potentially optimized here
    }

    public onResize(): void {
        this._setContextDimensions()
    }

    public update(screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker): void {
        const modifiedCells = deltaRegionTracker.getModifiedCells()

        if (modifiedCells.length === 0) {
            return
        }

        Performance.mark("CanvasRenderer.update.start")

        this._canvasContext.font = screenInfo.fontSize + " " + screenInfo.fontFamily
        this._canvasContext.textBaseline = "top"
        this._canvasContext.setTransform(this._devicePixelRatio, 0, 0, this._devicePixelRatio, 0, 0)
        this._canvasContext.imageSmoothingEnabled = false

        this._editorElement.style.fontFamily = screenInfo.fontFamily
        this._editorElement.style.fontSize = screenInfo.fontSize

        const rowsToEdit = getSpansToEdit(this._grid, modifiedCells)

        modifiedCells.forEach((c) => deltaRegionTracker.notifyCellRendered(c.x, c.y))

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

                if (cellsAreTheSame(currentCell, gridCellBefore)) {
                    const previousCell = this._grid.getCell(span.startX - 1, rowIndex)
                    if (previousCell) {
                        updatedStartX = previousCell.startX
                    }
                }

                if (cellsAreTheSame(currentCell, gridCellAfter)) {
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

    private _renderSpan(span: ISpan, y: number, screenInfo: IScreen): void {
        let prevState: IRenderState = {
            isWhitespace: false,
            foregroundColor: screenInfo.foregroundColor,
            backgroundColor: screenInfo.backgroundColor,
            text: "",
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

    private _getNextRenderState(cell: ICell, x: number, y: number, currentState: IRenderState): IRenderState {
        const isCurrentCellWhiteSpace = isWhiteSpace(cell.character)

        if (cell.foregroundColor !== currentState.foregroundColor
            || cell.backgroundColor !== currentState.backgroundColor
            || isCurrentCellWhiteSpace !== currentState.isWhitespace
            || cell.characterWidth > 1) {
            return {
                isWhitespace: isCurrentCellWhiteSpace,
                foregroundColor: cell.foregroundColor,
                backgroundColor: cell.backgroundColor,
                text: cell.character,
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
                width: currentState.width + adjustedCharacterWidth,
                startX: currentState.startX,
                y: currentState.y,
            }
        }
    }

    private _isNewState(oldState: IRenderState, newState: IRenderState) {
        return oldState.startX !== newState.startX
    }

    private _renderText(state: IRenderState, screenInfo: IScreen): void {

        // Spans can have a width of 0 if they are placeholders for cells
        // after a multibyte character. In this case, we don't need to bother
        // rendering or clearing, because that occurs with the multibyte character.
        if (state.width === 0) {
            return
        }

        const { backgroundColor, foregroundColor, text, startX, y } = state

        const { fontWidthInPixels, fontHeightInPixels, linePaddingInPixels } = screenInfo

        const boundsStartX = startX * fontWidthInPixels
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

        if (backgroundColor && backgroundColor !== screenInfo.backgroundColor) {

            this._canvasContext.fillStyle = backgroundColor
            // TODO: Width of non-english characters
            this._canvasContext.fillRect(normalizedBoundsStartX, y * fontHeightInPixels, normalizedBoundsWidth, fontHeightInPixels)
        } else {
            this._canvasContext.clearRect(normalizedBoundsStartX, y * fontHeightInPixels, normalizedBoundsWidth, fontHeightInPixels)
        }

        if (!state.isWhitespace) {
            this._canvasContext.fillStyle = foregroundColor
            this._canvasContext.fillText(text, boundsStartX, y * fontHeightInPixels + linePaddingInPixels / 2)
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

    private _setContextDimensions(): void {
        this._canvasElement.width = this._canvasElement.offsetWidth * this._devicePixelRatio
        this._canvasElement.height = this._canvasElement.offsetHeight * this._devicePixelRatio
    }
}
