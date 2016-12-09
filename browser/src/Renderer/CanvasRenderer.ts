import * as _ from "lodash"
import * as Config from "./../Config"
import { IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import { ICell, IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"
import { RenderCache } from "./RenderCache"

export class CanvasRenderer implements INeovimRenderer {
    private _canvas: HTMLCanvasElement
    private _canvasContext: CanvasRenderingContext2D

    private _renderCache: RenderCache

    private _lastRenderedCell: Grid<ICell> = new Grid<ICell>()

    public start(element: HTMLCanvasElement): void {
        // Assert canvas
        this._canvas = element
        this._setContextDimensions()
        this._canvasContext = <any> this._canvas.getContext("2d") // FIXME: null

        this._renderCache = new RenderCache(this._canvasContext, this._getPixelRatio())
    }

    public onAction(_action: any): void {
        return
    }

    public onResize(): void {
        this._setContextDimensions()

        this._lastRenderedCell.clear()
    }

    public update(screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker): void {
        this._canvasContext.font = screenInfo.fontSize + " " + screenInfo.fontFamily
        this._canvasContext.textBaseline = "top"
        const fontWidth = screenInfo.fontWidthInPixels * this._getPixelRatio()
        const fontHeight = screenInfo.fontHeightInPixels * this._getPixelRatio()

        // const canvasStart = performance.now()

        const numberOfCellsToRender = Config.getValue<number>("prototype.editor.maxCellsToRender")
        const cellsToRender = _.take(_.shuffle(deltaRegionTracker.getModifiedCells()), numberOfCellsToRender)

        cellsToRender.forEach((pos) => {
            const {x, y} = pos
            const drawX = x * fontWidth
            const drawY = y * fontHeight

            const cell = screenInfo.getCell(x, y)

            if (cell) {
                const lastRenderedCell = this._lastRenderedCell.getCell(x, y)

                if (lastRenderedCell === cell) {
                    deltaRegionTracker.notifyCellRendered(x, y)
                    return
                }

                if (lastRenderedCell
                    && lastRenderedCell.backgroundColor === cell.backgroundColor
                    && lastRenderedCell.character === cell.character
                    && lastRenderedCell.foregroundColor === cell.foregroundColor) {
                    this._lastRenderedCell.setCell(x, y, cell)
                    deltaRegionTracker.notifyCellRendered(x, y)
                    return
                }

                this._canvasContext.clearRect(drawX, drawY, fontWidth, fontHeight)

                const defaultBackgroundColor = "rgba(255, 255, 255, 0)"
                let backgroundColor = defaultBackgroundColor

                if (cell.backgroundColor && cell.backgroundColor !== screenInfo.backgroundColor) {
                    backgroundColor = cell.backgroundColor
                }

                if (cell.character !== "" && cell.character !== " ") {
                    const foregroundColor = cell.foregroundColor ? cell.foregroundColor : screenInfo.foregroundColor
                    this._renderCache.drawText(
                        cell.character,
                        backgroundColor,
                        foregroundColor,
                        drawX,
                        drawY,
                        <any> screenInfo.fontFamily, // FIXME: null
                        <any> screenInfo.fontSize, // FIXME: null
                        fontWidth,
                        fontHeight)
                } else if (backgroundColor !== defaultBackgroundColor) {
                    this._canvasContext.fillStyle = backgroundColor
                    this._canvasContext.fillRect(drawX, drawY, fontWidth, fontHeight)
                }

                this._lastRenderedCell.setCell(x, y, cell)
            } else {
                console.log(`Unset cell - x: ${x} y: ${y}`) // tslint:disable-line no-console
            }

            deltaRegionTracker.notifyCellRendered(x, y)
        })

        // const canvasEnd = performance.now()

        // TODO: Need a story for verbose logging
        // console.log("Render time: " + (canvasEnd - canvasStart))
    }

    private _getPixelRatio(): number {
        // TODO: Does the backingStoreContext need to be taken into account?
        // I believe this value should be consistent at least on the Electron platform
        return window.devicePixelRatio
    }

    private _setContextDimensions(): void {
        this._canvas.width = this._canvas.offsetWidth * this._getPixelRatio()
        this._canvas.height = this._canvas.offsetHeight * this._getPixelRatio()
    }

}
