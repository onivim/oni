import { Screen, Cell, PixelPosition, Position } from "./Screen"
import { DeltaRegionTracker } from "./DeltaRegionTracker"
import { Grid } from "./Grid"
import * as Config from "./Config"

const hexRgb = require("hex-rgb")

export interface NeovimRenderer {
    start(element: HTMLElement);
    update(screenInfo: Screen, deltaRegionTracker: DeltaRegionTracker);

    onResize(): void;
}

export class CanvasRenderer implements NeovimRenderer {
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

                if(cell) {
                    var lastRenderedCell = this._lastRenderedCell.getCell(x, y)

                    if(lastRenderedCell === cell)
                        return

                    const hexBackgroundColor = cell.backgroundColor || screenInfo.backgroundColor;
                    const rgb = hexRgb(hexBackgroundColor)
                    const backgroundColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`

                    if (opacity < 1) {
                        this._canvasContext.clearRect(drawX, drawY, fontWidth, fontHeight)
                    }

                    if(cell.character !== "" && cell.character !== " ") {
                        var foregroundColor = cell.foregroundColor ? cell.foregroundColor : screenInfo.foregroundColor
                        this._renderCache.drawText(cell.character, backgroundColor, foregroundColor, drawX, drawY, screenInfo.fontFamily, screenInfo.fontSize, fontWidth, fontHeight)
                    } else {
                        this._canvasContext.fillStyle = backgroundColor;
                        this._canvasContext.fillRect(drawX, drawY, fontWidth, fontHeight)
                    }

                    this._lastRenderedCell.setCell(x, y, cell)
                } else {
                    console.log(`Unset cell - x: ${x} y: ${y}`)
                }
            })
    }
}

export class RenderCache {
    private _canvasContext: CanvasRenderingContext2D;
    private _renderCache = {}

    constructor(canvasContext: CanvasRenderingContext2D) {
        this._canvasContext = canvasContext;
    }

    public drawText(character: string, backgroundColor: string, color: string, x: number, y: number, fontFamily: string, fontSize: string, fontWidth: number, fontHeight: number): void {

        var keyString = character + "_" + backgroundColor + "_" + color + "_" + fontFamily + "_" + fontSize;

        if(!this._renderCache[keyString]) {
            var canvas = document.createElement("canvas")
            canvas.width = fontWidth
            canvas.height = fontHeight
            var canvasContext = canvas.getContext("2d")

            canvasContext.font = "normal normal lighter " + fontSize + " " + fontFamily;
            canvasContext.textBaseline = "top";
            canvasContext.fillStyle = backgroundColor
            canvasContext.fillRect(0, 0, fontWidth, fontHeight)

            canvasContext.fillStyle = color
            canvasContext.fillText(character, 0, 0)

            this._renderCache[keyString] = canvas
        }

        let sourceCanvas = this._renderCache[keyString];
        this._canvasContext.drawImage(sourceCanvas, x, y);
    }
}
