import { INeovimRenderer } from ".."
import { MinimalScreenForRendering } from "../../neovim"
import { CachedColorNormalizer } from "./CachedColorNormalizer"
import { IColorNormalizer } from "./IColorNormalizer"
import { IWebGLAtlasOptions, WebGLTextureSpaceExceededError } from "./WebGLAtlas"
import { WebGLSolidRenderer } from "./WebGLSolidRenderer"
import { WebGlTextRenderer } from "./WebGLTextRenderer"

export class WebGLRenderer implements INeovimRenderer {
    private _editorElement: HTMLElement
    private _colorNormalizer: IColorNormalizer
    private _previousAtlasOptions: IWebGLAtlasOptions
    private _textureSizeInPixels = 1024
    private _textureLayerCount = 2

    private _gl: WebGL2RenderingContext
    private _solidRenderer: WebGLSolidRenderer
    private _textRenderer: WebGlTextRenderer

    public start(editorElement: HTMLElement): void {
        this._editorElement = editorElement
        this._colorNormalizer = new CachedColorNormalizer()

        const canvasElement = document.createElement("canvas")
        this._editorElement.innerHTML = ""
        this._editorElement.appendChild(canvasElement)

        this._gl = canvasElement.getContext("webgl2") as WebGL2RenderingContext
    }

    public redrawAll(screenInfo: MinimalScreenForRendering): void {
        if (!this._editorElement) {
            return
        }

        this._updateCanvasDimensions()
        this._createNewRendererIfRequired(screenInfo)
        this._clear(screenInfo.backgroundColor)

        try {
            this._draw(screenInfo)
        } catch (error) {
            if (error instanceof WebGLTextureSpaceExceededError) {
                this._textureLayerCount *= 2
                this.redrawAll(screenInfo)
            } else {
                throw error
            }
        }
    }

    public draw(screenInfo: MinimalScreenForRendering): void {
        this.redrawAll(screenInfo)
    }

    public onAction(action: any): void {
        // do nothing
    }

    private _updateCanvasDimensions() {
        const devicePixelRatio = window.devicePixelRatio
        const canvas = this._gl.canvas
        canvas.width = this._editorElement.offsetWidth * devicePixelRatio
        canvas.height = this._editorElement.offsetHeight * devicePixelRatio
        canvas.style.width = `${canvas.width / devicePixelRatio}px`
        canvas.style.height = `${canvas.height / devicePixelRatio}px`
    }

    private _createNewRendererIfRequired({
        width: columnCount,
        height: rowCount,
        fontWidthInPixels,
        fontHeightInPixels,
        linePaddingInPixels,
        fontFamily,
        fontSize,
    }: MinimalScreenForRendering) {
        const devicePixelRatio = window.devicePixelRatio
        const offsetGlyphVariantCount = Math.max(Math.ceil(4 / devicePixelRatio), 1)
        const atlasOptions = {
            fontFamily,
            fontSize,
            lineHeightInPixels: fontHeightInPixels,
            linePaddingInPixels,
            glyphPaddingInPixels: Math.ceil(fontHeightInPixels / 4),
            devicePixelRatio,
            offsetGlyphVariantCount,
            textureSizeInPixels: this._textureSizeInPixels,
            textureLayerCount: this._textureLayerCount,
        } as IWebGLAtlasOptions

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
    }: MinimalScreenForRendering) {
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
