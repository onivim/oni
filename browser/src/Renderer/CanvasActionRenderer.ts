import * as Actions from "./../actions"
import { IDeltaRegionTracker } from "./../DeltaRegionTracker"
import { IScreen } from "./../Screen"
import { RenderCache } from "./RenderCache"

/**
 * Canvas strategy that renders directly when an action comes in
 */
export class CanvasActionRenderer {
    private _canvas: HTMLCanvasElement
    private _canvasContext: CanvasRenderingContext2D

    private _renderCache: RenderCache

    // private _lastRenderedCell: Grid<Cell> = new Grid<Cell>()

    private _screen: IScreen

    public start(element: HTMLCanvasElement, screen: IScreen): void {
        // Assert canvas
        this._canvas = element
        this._canvas.width = this._canvas.offsetWidth
        this._canvas.height = this._canvas.offsetHeight
        this._canvasContext = <any> this._canvas.getContext("2d") // FIXME: null

        this._renderCache = new RenderCache(this._canvasContext)
        this._screen = screen
    }

    public onAction(action: any): void {

        const cursorRow = this._screen.cursorRow
        const cursorColumn = this._screen.cursorColumn

        const widthInPixels = this._screen.fontWidthInPixels
        const heightInPixels = this._screen.fontHeightInPixels

        const backgroundColor = this._screen.currentBackgroundColor
        const foregroundColor = this._screen.currentForegroundColor

        switch (action.type) {
            case Actions.PutAction:
                for (let i = 0; i < action.characters.length; i++) {
                    this._renderCache.drawText(action.characters[i],
                        backgroundColor,
                        foregroundColor,
                        (cursorColumn + i) * widthInPixels,
                        (cursorRow) * heightInPixels,
                        <any> this._screen.fontFamily, // FIXME: null
                        <any> this._screen.fontSize, // FIXME: null
                        widthInPixels,
                        heightInPixels)

                }
                break
            case Actions.CLEAR:
                this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height)
                break
            case Actions.CLEAR_TO_END_OF_LINE:
                this._canvasContext.clearRect(cursorColumn * widthInPixels,
                    cursorRow * heightInPixels,
                    (this._screen.width - cursorColumn) * widthInPixels,
                    heightInPixels)
                break
            case Actions.SCROLL:
                const count = action.scroll
                const region = this._screen.getScrollRegion()

                const x = region.left * heightInPixels
                const y = region.top * widthInPixels
                const width = region.right * widthInPixels - x
                const height = region.bottom * heightInPixels - y

                const imageData = this._canvasContext.getImageData(x, y, width, height)

                this._canvasContext.putImageData(imageData, x, y - (count * heightInPixels))

                if (count > 0) {
                    this._canvasContext.clearRect(x, height - (count * heightInPixels), width, count * heightInPixels)
                } else {
                    this._canvasContext.clearRect(x, 0, width, -count * heightInPixels)
                }
                break
            default:
                break
        }
    }

    public onResize(): void {
        const width = this._canvas.offsetWidth
        const height = this._canvas.offsetHeight
        this._canvas.width = width
        this._canvas.height = height
    }

    public update(_screenInfo: IScreen, _deltaRegionTracker: IDeltaRegionTracker): void {
        return
    }
}
