import { IDeltaCellPosition, IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import * as Performance from "./../Performance"
import { IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

import { /*combineSpansAtBoundary,*/ collapseSpans, ISpan } from "./Span"

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

        this._canvasContext = this._canvasElement.getContext("2d")

        this._editorElement.appendChild(this._canvasElement)

        this._setContextDimensions()

        this._devicePixelRatio = window.devicePixelRatio
    }

    public onAction(_action: any): void {
        // No-op
    }

    public onResize(): void {
        // No-op
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

                // // check if beginning boundary can be combined
                // combineSpansAtBoundary(span.startX, y, screenInfo.fontWidthInPixels, this._grid, this._elementFactory)

                // // check if following boundary can be combined
                // combineSpansAtBoundary(span.endX, y, screenInfo.fontWidthInPixels, this._grid, this._elementFactory)
            })
        }

        Performance.mark("CanvasRenderer.update.end")
    }

    private _renderSpan(span: ISpan, y: number, screenInfo: IScreen): void {
        const fontWidth = screenInfo.fontWidthInPixels * this._getPixelRatio()
        const fontHeight = screenInfo.fontHeightInPixels * this._getPixelRatio()

        this._canvasContext.fillStyle = "white"

        this._canvasContext.clearRect(span.startX * fontWidth, y * fontHeight, (span.endX - span.startX) * fontWidth, fontHeight)

        let currentString = ""
        let startX = span.startX

        let foregroundColor = screenInfo.foregroundColor
        let backgroundColor = screenInfo.backgroundColor

        for (let x = span.startX; x < span.endX; x++) {
            const cell = screenInfo.getCell(x, y)

            if (cell.foregroundColor !== foregroundColor
                || cell.backgroundColor !== backgroundColor) {

                this._renderText(currentString, startX * fontWidth, y * fontHeight, screenInfo, foregroundColor, backgroundColor)

                foregroundColor = cell.foregroundColor
                backgroundColor = cell.backgroundColor
                currentString = cell.character
                startX = x
            } else {
                currentString += cell.character
            }
        }

        this._renderText(currentString, startX * fontWidth, y * fontHeight, screenInfo, foregroundColor, backgroundColor)
    }

    private _renderText(text: string, x: number, y: number, screenInfo: IScreen, foregroundColor: string, backgroundColor?: string): void {

        if (text.trim().length === 0)
            return

        if (backgroundColor && backgroundColor !== screenInfo.currentBackgroundColor) {

            this._canvasContext.fillStyle = backgroundColor
            // TODO: Width of non-english characters
            this._canvasContext.fillRect(x, y, text.length * screenInfo.fontWidthInPixels, screenInfo.fontHeightInPixels)
        }

        this._canvasContext.fillStyle = foregroundColor
        this._canvasContext.fillText(text, x, y)
    }

    private _setContextDimensions(): void {
        this._canvasElement.width = this._canvasElement.offsetWidth * this._getPixelRatio()
        this._canvasElement.height = this._canvasElement.offsetHeight * this._getPixelRatio()
    }

    private _getPixelRatio(): number {
        // TODO: Does the `backingStoreContext` need to be taken into account?
        // I believe this value should be consistent - at least on the electron platform
        return this._devicePixelRatio
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

