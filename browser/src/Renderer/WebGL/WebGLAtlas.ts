const backgroundColor = "black"
const foregroundColor = "white"

export interface IWebGLAtlasOptions {
    fontFamily: string
    fontSize: string
    lineHeightInPixels: number
    linePaddingInPixels: number
    devicePixelRatio: number
    offsetGlyphVariantCount: number
    textureSizeInPixels: number
    textureLayerCount: number
}

export interface WebGLGlyph {
    width: number
    height: number
    textureIndex: number
    textureWidth: number
    textureHeight: number
    textureU: number
    textureV: number
    variantOffset: number
    subpixelWidth: number
}

export class WebGLTextureSpaceExceededError extends Error {}

export class WebGLAtlas {
    private _glyphContext: CanvasRenderingContext2D
    private _glyphs = new Map<string, Map<number, WebGLGlyph>>()
    private _texture: WebGLTexture
    private _currentTextureLayerIndex = 0
    private _currentTextureLayerChangedSinceLastUpload = false
    private _nextX = 0
    private _nextY = 0

    constructor(private _gl: WebGL2RenderingContext, private _options: IWebGLAtlasOptions) {
        const glyphCanvas = document.createElement("canvas")
        glyphCanvas.width = this._options.textureSizeInPixels
        glyphCanvas.height = this._options.textureSizeInPixels
        this._glyphContext = glyphCanvas.getContext("2d", { alpha: false })
        this._glyphContext.font = `${this._options.fontSize} ${this._options.fontFamily}`
        this._glyphContext.fillStyle = foregroundColor
        this._glyphContext.textBaseline = "top"
        this._glyphContext.scale(_options.devicePixelRatio, _options.devicePixelRatio)
        this._glyphContext.imageSmoothingEnabled = false

        document.body.appendChild(glyphCanvas)

        this._texture = this._gl.createTexture()
        this._gl.bindTexture(this._gl.TEXTURE_2D_ARRAY, this._texture)
        this._gl.texParameteri(
            this._gl.TEXTURE_2D_ARRAY,
            this._gl.TEXTURE_MIN_FILTER,
            this._gl.LINEAR,
        )
        this._gl.texParameteri(
            this._gl.TEXTURE_2D_ARRAY,
            this._gl.TEXTURE_WRAP_S,
            this._gl.CLAMP_TO_EDGE,
        )
        this._gl.texParameteri(
            this._gl.TEXTURE_2D_ARRAY,
            this._gl.TEXTURE_WRAP_T,
            this._gl.CLAMP_TO_EDGE,
        )

        const textureLayerCount = Math.min(
            this._options.textureLayerCount,
            this._gl.MAX_ARRAY_TEXTURE_LAYERS,
        )
        this._gl.texImage3D(
            this._gl.TEXTURE_2D_ARRAY,
            0,
            this._gl.RGBA,
            this._options.textureSizeInPixels,
            this._options.textureSizeInPixels,
            textureLayerCount,
            0,
            this._gl.RGBA,
            this._gl.UNSIGNED_BYTE,
            null,
        )
    }

    public getGlyph(text: string, variantIndex: number) {
        let glyphVariants = this._glyphs.get(text)
        if (!glyphVariants) {
            glyphVariants = new Map()
            this._glyphs.set(text, glyphVariants)
        }

        let glyph = glyphVariants.get(variantIndex)
        if (!glyph) {
            glyph = this._rasterizeGlyph(text, variantIndex)
            glyphVariants.set(variantIndex, glyph)
        }

        return glyph
    }

    public uploadTexture() {
        if (this._currentTextureLayerChangedSinceLastUpload) {
            this._gl.bindTexture(this._gl.TEXTURE_2D_ARRAY, this._texture)
            this._gl.texSubImage3D(
                this._gl.TEXTURE_2D_ARRAY,
                0,
                0,
                0,
                this._currentTextureLayerIndex,
                this._options.textureSizeInPixels,
                this._options.textureSizeInPixels,
                1,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                this._glyphContext.canvas,
            )
            this._currentTextureLayerChangedSinceLastUpload = false
        }
    }

    private _rasterizeGlyph(text: string, variantIndex: number) {
        this._currentTextureLayerChangedSinceLastUpload = true

        const {
            devicePixelRatio,
            lineHeightInPixels,
            linePaddingInPixels,
            offsetGlyphVariantCount,
        } = this._options
        const variantOffset = variantIndex / offsetGlyphVariantCount

        const height = lineHeightInPixels
        const { width: subpixelWidth } = this._glyphContext.measureText(text)
        const width = Math.ceil(variantOffset) + Math.ceil(subpixelWidth)

        if ((this._nextX + width) * devicePixelRatio > this._options.textureSizeInPixels) {
            this._nextX = 0
            this._nextY = Math.ceil(this._nextY + height)
        }

        if ((this._nextY + height) * devicePixelRatio > this._options.textureSizeInPixels) {
            this._switchToNextLayer()
        }

        const x = this._nextX
        const y = this._nextY
        this._glyphContext.fillText(text, x + variantOffset, y + linePaddingInPixels / 2)
        this._nextX += width

        return {
            width: width * devicePixelRatio,
            height: height * devicePixelRatio,
            textureIndex: this._currentTextureLayerIndex,
            textureU: x * devicePixelRatio / this._options.textureSizeInPixels,
            textureV: y * devicePixelRatio / this._options.textureSizeInPixels,
            textureWidth: width * devicePixelRatio / this._options.textureSizeInPixels,
            textureHeight: height * devicePixelRatio / this._options.textureSizeInPixels,
            subpixelWidth: subpixelWidth * devicePixelRatio,
            variantOffset,
        } as WebGLGlyph
    }

    private _switchToNextLayer() {
        if (this._currentTextureLayerIndex + 1 >= this._options.textureLayerCount) {
            throw new WebGLTextureSpaceExceededError(
                "The WebGL renderer ran out of texture space. Please re-open the editor " +
                    "with more texture layers or switch to a different renderer.",
            )
        }

        this.uploadTexture()

        this._glyphContext.fillStyle = backgroundColor
        this._glyphContext.fillRect(
            0,
            0,
            this._glyphContext.canvas.width,
            this._glyphContext.canvas.width,
        )
        this._glyphContext.fillStyle = foregroundColor
        this._currentTextureLayerIndex++
        this._nextX = 0
        this._nextY = 0
        this._currentTextureLayerChangedSinceLastUpload = true
    }
}
