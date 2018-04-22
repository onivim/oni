import { INeovimRenderer } from ".."
import { IScreen } from "../../neovim"
import { CachedColorNormalizer } from "./CachedColorNormalizer"
import { IColorNormalizer } from "./IColorNormalizer"
import { IWebGLAtlasOptions } from "./WebGLAtlas"
import { WebGLSolidRenderer } from "./WebGLSolidRenderer"
import { WebGlTextRenderer } from "./WebGLTextRenderer"

export const subpixelDivisor = 4 // TODO move this somewhere else

export class WebGLRenderer implements INeovimRenderer {
    private _editorElement: HTMLElement
    private _colorNormalizer: IColorNormalizer
    private _previousAtlasOptions: IWebGLAtlasOptions

    private _gl: WebGL2RenderingContext
    private _solidRenderer: WebGLSolidRenderer
    private _textRenderer: WebGlTextRenderer

    public start(editorElement: HTMLElement): void {
        this._editorElement = editorElement
        this._colorNormalizer = new CachedColorNormalizer()

        const canvasElement = document.createElement("canvas")
        canvasElement.style.width = `100%`
        canvasElement.style.height = `100%`

        this._editorElement.innerHTML = ""
        this._editorElement.appendChild(canvasElement)

        this._gl = canvasElement.getContext("webgl2") as WebGL2RenderingContext
    }

    public redrawAll(screenInfo: IScreen): void {
        this._updateCanvasDimensions()
        this._createNewRendererIfRequired(screenInfo)
        this._clear(screenInfo.backgroundColor)
        this._draw(screenInfo)
    }

    public draw(screenInfo: IScreen): void {
        this.redrawAll(screenInfo)
    }

    public onAction(action: any): void {
        // do nothing
    }

    private _updateCanvasDimensions() {
        const devicePixelRatio = window.devicePixelRatio
        this._gl.canvas.width = this._editorElement.offsetWidth * devicePixelRatio
        this._gl.canvas.height = this._editorElement.offsetHeight * devicePixelRatio
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
        const atlasOptions = {
            fontFamily,
            fontSize,
            lineHeight: fontHeightInPixels,
            devicePixelRatio,
            subpixelDivisor,
        }

        if (
            !this._solidRenderer ||
            !this._textRenderer ||
            !this._previousAtlasOptions ||
            !isShallowEqual(this._previousAtlasOptions, atlasOptions)
        ) {
            this._solidRenderer = new WebGLSolidRenderer(
                this._gl,
                this._colorNormalizer,
                atlasOptions.devicePixelRatio,
            )
            this._textRenderer = new WebGlTextRenderer(
                this._gl,
                this._colorNormalizer,
                atlasOptions,
            )
            this._previousAtlasOptions = atlasOptions
        }
    }

    private _clear(backgroundColor: string) {
        const backgroundColorToUse = backgroundColor || "black"
        const normalizedBackgroundColor = this._colorNormalizer.normalizeColor(backgroundColorToUse)
        this._gl.clearColor(
            normalizedBackgroundColor[0],
            normalizedBackgroundColor[1],
            normalizedBackgroundColor[2],
            normalizedBackgroundColor[3],
        )
        this._gl.clear(this._gl.COLOR_BUFFER_BIT)
    }

    private _draw({
        width: columnCount,
        height: rowCount,
        fontWidthInPixels,
        fontHeightInPixels,
        getCell,
        foregroundColor,
        backgroundColor,
    }: IScreen) {
        const canvasWidth = this._gl.canvas.width
        const canvasHeight = this._gl.canvas.height
        const viewportScaleX = 2 / canvasWidth
        const viewportScaleY = -2 / canvasHeight
        this._gl.viewport(0, 0, canvasWidth, canvasHeight)

        this._solidRenderer.draw(
            columnCount,
            rowCount,
            getCell,
            fontWidthInPixels,
            fontHeightInPixels,
            backgroundColor,
            viewportScaleX,
            viewportScaleY,
        )
        this._textRenderer.draw(
            columnCount,
            rowCount,
            getCell,
            fontWidthInPixels,
            fontHeightInPixels,
            foregroundColor,
            viewportScaleX,
            viewportScaleY,
        )
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
