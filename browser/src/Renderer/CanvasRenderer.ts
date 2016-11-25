import { Screen, Cell, PixelPosition, Position } from "./../Screen"
import { DeltaRegionTracker } from "./../DeltaRegionTracker"
import { Grid } from "./../Grid"
import * as Config from "./../Config"

import { RenderCache } from "./RenderCache"
import { INeovimRenderer } from "./INeovimRenderer"

export class CanvasRenderer implements INeovimRenderer {
    private _canvas: HTMLCanvasElement;
    private _canvasContext: CanvasRenderingContext2D;

    private _renderCache: RenderCache;

    private _lastRenderedCell: Grid<Cell> = new Grid<Cell>()

    public start(element: HTMLCanvasElement): void {
        // Assert canvas
        this._canvas = element;
        this._canvas.width = this._canvas.offsetWidth;
        this._canvas.height = this._canvas.offsetHeight;
        this._canvasContext = this._canvas.getContext("2d");

        this._renderCache = new RenderCache(this._canvasContext);
    }

    public onAction(action: any): void {

    }

    public onResize(): void {
        var width = this._canvas.offsetWidth;
        var height = this._canvas.offsetHeight;
        this._canvas.width = width;
        this._canvas.height = height
    }

    public update(screenInfo: Screen, deltaRegionTracker: DeltaRegionTracker): void {
        this._canvasContext.font = screenInfo.fontSize + " " + screenInfo.fontFamily
        this._canvasContext.textBaseline = "top";
        const fontWidth = screenInfo.fontWidthInPixels
        const fontHeight = screenInfo.fontHeightInPixels

        const opacity = Config.getValue<number>("prototype.editor.backgroundOpacity")

        var cells = deltaRegionTracker.getModifiedCells()
            .forEach(pos => {

                var x = pos.x
                var y = pos.y

                var drawX = x * fontWidth;
                var drawY = y * fontHeight;

                var cell = screenInfo.getCell(x, y);

                if (cell) {
                    var lastRenderedCell = this._lastRenderedCell.getCell(x, y)

                    if (lastRenderedCell === cell)
                        return

                    this._canvasContext.clearRect(drawX, drawY, fontWidth, fontHeight)

                    const defaultBackgroundColor = "rgba(255, 255, 255, 0)"
                    let backgroundColor = defaultBackgroundColor

                    if (cell.backgroundColor && cell.backgroundColor !== screenInfo.backgroundColor)
                        backgroundColor = cell.backgroundColor

                    if (cell.character !== "" && cell.character !== " ") {
                        var foregroundColor = cell.foregroundColor ? cell.foregroundColor : screenInfo.foregroundColor
                        this._renderCache.drawText(cell.character, backgroundColor, foregroundColor, drawX, drawY, screenInfo.fontFamily, screenInfo.fontSize, fontWidth, fontHeight)
                    } else if (backgroundColor !== defaultBackgroundColor) {
                        this._canvasContext.fillStyle = backgroundColor
                        this._canvasContext.fillRect(drawX, drawY, fontWidth, fontHeight)
                    }

                    this._lastRenderedCell.setCell(x, y, cell)
                } else {
                    console.log(`Unset cell - x: ${x} y: ${y}`)
                }
            })
    }
}
