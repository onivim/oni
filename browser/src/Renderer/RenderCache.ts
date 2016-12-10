
const FallbackFonts = "Consolas,Monaco,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace"

/**
 * RenderCache caches rendered letter of a specific configuration.
 *
 * It turns out that, in many cases, it is faster to use ctx.drawImage vs ctx.fillText + all the state changes.
 */
export class RenderCache {
    private _canvasContext: CanvasRenderingContext2D
    private _renderCache = {}
    private _pixelRatio: number = 1

    constructor(canvasContext: CanvasRenderingContext2D, pixelRatio: number) {
        this._canvasContext = canvasContext
        this._pixelRatio = pixelRatio
    }

    public drawText(character: string, backgroundColor: string, color: string, x: number, y: number, fontFamily: string, fontSize: string, fontWidth: number, fontHeight: number): void {

        const keyString = character + "_" + backgroundColor + "_" + color + "_" + fontFamily + "_" + fontSize

        if (!this._renderCache[keyString]) {
            const canvas = document.createElement("canvas")
            canvas.width = fontWidth
            canvas.height = fontHeight
            const canvasContext = <any> canvas.getContext("2d") // FIXME: null
            canvasContext.setTransform(this._pixelRatio, 0, 0, this._pixelRatio, 0, 0)

            canvasContext.font = `normal normal lighter ${fontSize} ${fontFamily} ${FallbackFonts}"
            canvasContext.textBaseline = "top"
            canvasContext.fillStyle = backgroundColor
            canvasContext.fillRect(0, 0, fontWidth, fontHeight)

            canvasContext.fillStyle = color
            canvasContext.fillText(character, 0, 0)

            this._renderCache[keyString] = canvas
        }

        const sourceCanvas = this._renderCache[keyString]
        this._canvasContext.drawImage(sourceCanvas, x, y)
    }
}
