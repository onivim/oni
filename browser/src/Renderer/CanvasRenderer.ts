import { IDeltaCellPosition, IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import * as Performance from "./../Performance"
import { ICell, IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

import { /*combineSpansAtBoundary,*/ collapseSpans, ISpan } from "./Span"

import { CanvasTextRenderCache } from "./CanvasTextRenderCache"

export interface IRenderState {
    isWhitespace: boolean
    foregroundColor: string
    backgroundColor: string
    text: string
    startX: number
    y: number
    width: number
}

export class CanvasRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    private _canvasElement: HTMLCanvasElement
    private _canvasContext: CanvasRenderingContext2D
    private _grid: Grid<ISpan> = new Grid<ISpan>()

    private _devicePixelRatio: number

    private _canvasRenderCache: CanvasTextRenderCache

    public start(element: HTMLDivElement): void {
        this._editorElement = element

        this._canvasElement = document.createElement("canvas")
        this._canvasElement.style.width = "100%"
        this._canvasElement.style.height = "100%"

        this._canvasContext = this._canvasElement.getContext("2d")

        this._editorElement.appendChild(this._canvasElement)

        this._setContextDimensions()

        this._devicePixelRatio = window.devicePixelRatio
        this._canvasRenderCache = new CanvasTextRenderCache(this._canvasContext, this._devicePixelRatio)
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
        this._canvasContext.setTransform(this._getPixelRatio(), 0, 0, this._getPixelRatio(), 0, 0)
        this._canvasContext.imageSmoothingEnabled = false

        this._editorElement.style.fontFamily = screenInfo.fontFamily
        this._editorElement.style.fontSize = screenInfo.fontSize

        const rowsToEdit = getSpansToEdit2(this._grid, modifiedCells)

        modifiedCells.forEach((c) => deltaRegionTracker.notifyCellRendered(c.x, c.y))

        for (let y of Object.keys(rowsToEdit)) {
            const row = rowsToEdit[y]

            if (!row) {
                return
            }

            row.forEach((span: ISpan) => {
                // All spans that have changed in current rendering pass
                this._renderSpan(span, Number.parseInt(y), screenInfo)
            })
        }

        Performance.mark("CanvasRenderer.update.end")
    }

    private _renderSpan(span: ISpan, y: number, screenInfo: IScreen): void {
        const fontWidth = screenInfo.fontWidthInPixels
        const fontHeight = screenInfo.fontHeightInPixels

        this._canvasContext.fillStyle = "white"

        this._canvasContext.clearRect(span.startX * fontWidth, y * fontHeight, (span.endX - span.startX) * fontWidth, fontHeight)

        let prevState: IRenderState = {
            isWhitespace: false,
            foregroundColor: screenInfo.foregroundColor,
            backgroundColor: screenInfo.backgroundColor,
            text: "",
            startX: span.startX,
            y,
            width: 0,
        }

        for (let x = span.startX; x < span.endX; x++) {
            const cell = screenInfo.getCell(x, y)

            const nextRenderState = this._getNextRenderState(cell, x, y, prevState)

            if (this._isNewState(prevState, nextRenderState)) {
                this._renderText(prevState, screenInfo)
            }

            prevState = nextRenderState
        }

        this._renderText(prevState, screenInfo)
    }

    private _getNextRenderState(cell: ICell, x: number, y: number, currentState: IRenderState): IRenderState {

        const isWhiteSpace = (text: string) => text === null || text === "" || text === " "

        const isCurrentCellWhiteSpace = isWhiteSpace(cell.character)

        if (cell.foregroundColor !== currentState.foregroundColor
            || cell.backgroundColor !== currentState.backgroundColor
            || cell.characterWidth > 1
            || isCurrentCellWhiteSpace !== currentState.isWhitespace) {
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
            // Not using spread (...) operator, which would simplify this,
            // because this is a hot-path for rendering and `Object.assign`
            // has some overhead that showed up in the profile.
            return {
                isWhitespace: currentState.isWhitespace,
                foregroundColor: cell.foregroundColor,
                backgroundColor: cell.backgroundColor,
                text: currentState.text + cell.character,
                width: currentState.width + cell.characterWidth,
                startX: currentState.startX,
                y: currentState.y,
            }
        }
    }

    private _isNewState(oldState: IRenderState, newState: IRenderState) {
        return oldState.startX !== newState.startX
    }

    private _renderText(state: IRenderState, screenInfo: IScreen): void {

        const { backgroundColor, foregroundColor, text, startX, y } = state

        const fontWidth = screenInfo.fontWidthInPixels
        const fontHeight = screenInfo.fontHeightInPixels

        if (text.trim().length === 0)
            return

        if (backgroundColor && backgroundColor !== screenInfo.currentBackgroundColor) {

            this._canvasContext.fillStyle = backgroundColor
            // TODO: Width of non-english characters
            this._canvasContext.fillRect(startX * fontWidth, y * fontHeight, state.width * fontWidth, fontHeight)
        }

        if (!state.isWhitespace) {
            // this._canvasRenderCache.drawText(text, 
            //                                  foregroundColor, 
            //                                  startX * fontWidth, 
            //                                  y * fontHeight,
            //                                  screenInfo.fontFamily,
            //                                  screenInfo.fontSize,
            //                                  state.width * fontWidth,
            //                                  fontHeight)
            this._canvasContext.fillStyle = foregroundColor
            this._canvasContext.fillText(text, startX * fontWidth, y * fontHeight)
        }
    }

    private _setContextDimensions(): void {
        this._canvasElement.width = this._canvasElement.offsetWidth * this._getPixelRatio()
        this._canvasElement.height = this._canvasElement.offsetHeight * this._getPixelRatio()
    }

    private _getPixelRatio(): number {
        // TODO: Does the `backingStoreContext` need to be taken into account?
        // I believe this value should be consistent - at least on the electron platform
        return window.devicePixelRatio
        //return this._devicePixelRatio
    }
}

export type RowMap = { [key: number]: ISpan[] }

export function getSpansToEdit2(grid: Grid<ISpan>, cells: IDeltaCellPosition[]): RowMap {
    const rowToSpans: RowMap = {}
    cells.forEach((cell) => {
        const { x, y } = cell

        const info = grid.getCell(x, y)
        const currentRow = rowToSpans[y] || []

        if (!info) {
            currentRow.push({
                startX: x,
                endX: x + 1,
            })
        } else {
            currentRow.push({
                startX: info.startX,
                endX: info.endX,
            })

            grid.setRegion(info.startX, y, info.endX - info.startX, 1, null)
        }

        rowToSpans[y] = currentRow
    })
    return collapseSpanMap2(rowToSpans)
}

export function collapseSpanMap2(currentSpanMap: RowMap): RowMap {
    const outMap = {}
    for (let k of Object.keys(currentSpanMap)) {
        outMap[k] = collapseSpans(currentSpanMap[k])
    }

    return outMap
}

