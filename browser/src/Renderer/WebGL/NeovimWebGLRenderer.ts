import { INeovimRenderer } from ".."
import { IScreen } from "../../neovim"
import { IWebGLAtlasOptions } from "./WebGLAtlas"
import { WebGLRenderer } from "./WebGLRenderer"

export const SUBPIXEL_DIVISOR = 4 // TODO move this somewhere else

export class NeovimWebGLRenderer implements INeovimRenderer {
    private _previousAtlasOptions: IWebGLAtlasOptions
    private _editorElement: HTMLElement
    private _canvasElement: HTMLCanvasElement
    private _webGLRenderer: WebGLRenderer

    public start(editorElement: HTMLElement): void {
        this._editorElement = editorElement
        this._editorElement.innerHTML = ""

        this._canvasElement = document.createElement("canvas")
        this._canvasElement.style.width = `100%`
        this._canvasElement.style.height = `100%`
        this._editorElement.appendChild(this._canvasElement)
    }

    public redrawAll(screenInfo: IScreen): void {
        this._createNewRendererIfRequired(screenInfo)
        this._webGLRenderer.draw(screenInfo)
    }

    public draw(screenInfo: IScreen): void {
        this.redrawAll(screenInfo)
    }

    public onAction(action: any): void {
        // do nothing
    }

    private _createNewRendererIfRequired({
        width: columnCount,
        height: rowCount,
        fontWidthInPixels,
        fontHeightInPixels,
        linePaddingInPixels,
        fontFamily,
        fontSize,
    }: IScreen) {
        const devicePixelRatio = window.devicePixelRatio

        this._canvasElement.width = this._editorElement.offsetWidth * devicePixelRatio
        this._canvasElement.height = this._editorElement.offsetHeight * devicePixelRatio

        // if (
        //     configuration.getValue("editor.backgroundImageUrl") &&
        //     configuration.getValue("editor.backgroundOpacity") < 1.0
        // ) {
        //     this._canvasContext = this._canvasElement.getContext("2d", { alpha: true })
        //     this._isOpaque = false
        // } else {
        //     this._canvasContext = this._canvasElement.getContext("2d", { alpha: false })
        //     this._isOpaque = true
        // }
        const atlasOptions = {
            fontFamily,
            fontSize,
            lineHeight: fontHeightInPixels,
            devicePixelRatio,
            subpixelDivisor: SUBPIXEL_DIVISOR,
        }
        if (
            !this._webGLRenderer ||
            !this._previousAtlasOptions ||
            !isShallowEqual(this._previousAtlasOptions, atlasOptions)
        ) {
            this._webGLRenderer = new WebGLRenderer(this._canvasElement, atlasOptions)
            this._previousAtlasOptions = atlasOptions
        }
    }
}

function isShallowEqual<T>(objectA: T, objectB: T) {
    for (const key in objectA) {
        if (!(key in objectB) || objectA[key] !== objectB[key]) {
            return false
        }
    }

    for (const key in objectB) {
        if (!(key in objectA) || objectA[key] !== objectB[key]) {
            return false
        }
    }

    return true
}
