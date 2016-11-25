export class RenderCache {
    private _canvasContext: CanvasRenderingContext2D;
    private _renderCache = {}

    constructor(canvasContext: CanvasRenderingContext2D) {
        this._canvasContext = canvasContext;
    }

    public drawText(character: string, backgroundColor: string, color: string, x: number, y: number, fontFamily: string, fontSize: string, fontWidth: number, fontHeight: number): void {

        var keyString = character + "_" + backgroundColor + "_" + color + "_" + fontFamily + "_" + fontSize;

        if (!this._renderCache[keyString]) {
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
