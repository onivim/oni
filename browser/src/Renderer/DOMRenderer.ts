import { IDeltaCellPosition, IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import * as Performance from "./../Performance"
import { IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

import { IElementFactory, RecycleElementFactory } from "./ElementFactory"

import { collapseSpanMap, combineSpansAtBoundary, ISpan, ISpanElementInfo } from "./Span"

import { getRendererForCell, ITokenRenderer } from "./TokenRenderer"

// TODO: Look at scroll perf

export class DOMRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    private _grid: Grid<ISpanElementInfo> = new Grid<ISpanElementInfo>()
    private _elementFactory: IElementFactory

    public start(element: HTMLDivElement, elementFactory?: IElementFactory): void {
        this._elementFactory = elementFactory || new RecycleElementFactory(element)

        this._editorElement = element
    }

    public onAction(_action: any): void {
        // No-op
    }

    public onResize(): void {
        // No-op
    }

    public update(screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker): void {

        const modifiedCells = deltaRegionTracker.getModifiedCells()

        if (modifiedCells.length === 0) {
            return
        }

        Performance.mark("DOMRenderer.update.start")

        this._editorElement.style.fontFamily = screenInfo.fontFamily
        this._editorElement.style.fontSize = screenInfo.fontSize

        const rowsToEdit = getSpansToEdit(this._grid, modifiedCells, this._elementFactory)

        modifiedCells.forEach((c) => deltaRegionTracker.notifyCellRendered(c.x, c.y))

        for (let y of rowsToEdit.keys()) {
            const row = rowsToEdit.get(y)

            if (!row) {
                return
            }

            row.forEach((span: ISpan) => {
                this._renderSpan(span.startX, span.endX, y, screenInfo)

                // check if beginning boundary can be combined
                combineSpansAtBoundary(span.startX, y, screenInfo.fontWidthInPixels, this._grid, this._elementFactory)

                // check if following boundary can be combined
                combineSpansAtBoundary(span.endX, y, screenInfo.fontWidthInPixels, this._grid, this._elementFactory)
            })
        }

        Performance.mark("DOMRenderer.update.end")
    }

    private _renderSpan(startX: number, endX: number, y: number, screenInfo: IScreen): void {
        let currentRenderer: ITokenRenderer | null = null

        for (let x = startX; x < endX; x++) {

            const cell = screenInfo.getCell(x, y)

            if (!currentRenderer) {
                currentRenderer = getRendererForCell(x, y, cell, screenInfo, this._elementFactory)
            } else if (!currentRenderer.canHandleCell(cell)) {
                this._applyRenderedToken(currentRenderer)
                currentRenderer = getRendererForCell(x, y, cell, screenInfo, this._elementFactory)
            }

            if (currentRenderer) {
                currentRenderer.appendCell(cell)
            }
        }

        if (currentRenderer) {
            this._applyRenderedToken(currentRenderer)
        }
    }

    /**
     * Apply the token to the DOM, and update our grid storage to reflect the state
     */
    private _applyRenderedToken(renderer: ITokenRenderer): void {
        const { y, width } = renderer
        const startX = renderer.x

        const tag = renderer.getTag()

        const element = tag || null

        const infoToSave = {
            startX,
            element,
            endX: startX + width,
            foregroundColor: renderer.foregroundColor,
            backgroundColor: renderer.backgroundColor,
            canCombine: renderer.canCombine,
        }

        for (let x = startX; x < startX + width; x++) {
            this._grid.setCell(x, y, infoToSave)
        }
    }
}

export function getSpansToEdit(grid: Grid<ISpanElementInfo>, cells: IDeltaCellPosition[], elementFactory: IElementFactory): Map<number, ISpan[]> {
    const rowToSpans = new Map<number, ISpan[]>()
    cells.forEach((cell) => {
        const { x, y } = cell

        const info = grid.getCell(x, y)
        const currentRow = rowToSpans.get(y) || []

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

            if (info.element) {
                elementFactory.recycle(info.element)
            }

            grid.setRegion(info.startX, y, info.endX - info.startX, 1, null)
        }

        rowToSpans.set(y, currentRow)
    })
    return collapseSpanMap(rowToSpans)
}
