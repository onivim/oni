import { FallbackFonts } from "./../Font"

/**
 * RenderCache caches rendered letter of a specific configuration.
 *
 * It turns out that, in many cases, it is faster to use ctx.drawImage vs ctx.fillText + all the state changes.
 */
export class CanvasTextRenderCache {
    private _canvasContext: CanvasRenderingContext2D
    private _renderCache = {}
    private _pixelRatio: number = 1

    constructor(canvasContext: CanvasRenderingContext2D, pixelRatio: number) {
        this._canvasContext = canvasContext
        this._pixelRatio = pixelRatio
    }

    public drawText(character: string, color: string, x: number, y: number, fontFamily: string, fontSize: string, totalWidth: number, totalHeight: number): void {

        const keyString = "|" + character + "|_"+ color + "_" + fontFamily + "_" + fontSize

        if (!this._renderCache[keyString]) {
            const canvas = document.createElement("canvas")
            canvas.width = totalWidth * this._pixelRatio
            canvas.height = totalHeight * this._pixelRatio
            const canvasContext = <any> canvas.getContext("2d") // FIXME: null
            canvasContext.setTransform(this._pixelRatio, 0, 0, this._pixelRatio, 0, 0)
            canvasContext.imageSmoothingEnabled = false

            canvasContext.font = `normal normal lighter ${fontSize} ${fontFamily},${FallbackFonts}`
            canvasContext.textBaseline = "top"

            canvasContext.fillStyle = color
            canvasContext.fillText(character, 0, 0)

            this._renderCache[keyString] = canvas
        }

        const sourceCanvas = this._renderCache[keyString]
        this._canvasContext.drawImage(sourceCanvas, x, y)
    }
}
