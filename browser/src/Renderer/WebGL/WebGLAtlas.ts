const textureSizeInPixels = 1024 // This should be a safe size for all graphics chips
const maxTextureCount = 8 // TODO possibly use MAX_ARRAY_TEXTURE_LAYERS here
const backgroundColor = "black"
const foregroundColor = "white"

export interface IWebGLAtlasOptions {
    fontFamily: string
    fontSize: string
    lineHeightInPixels: number
    linePaddingInPixels: number
    devicePixelRatio: number
    offsetGlyphVariantCount: number
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

export class WebGLAtlas {
    private _glyphContext: CanvasRenderingContext2D
    private _glyphs = new Map<string, Map<number, WebGLGlyph>>()
    private _texture: WebGLTexture
    private _currentTextureIndex = 0
    private _currentTextureChangedSinceLastUpload = false
    private _nextX = 0
    private _nextY = 0

    constructor(private _gl: WebGL2RenderingContext, private _options: IWebGLAtlasOptions) {
        const glyphCanvas = document.createElement("canvas")
        glyphCanvas.width = textureSizeInPixels
        glyphCanvas.height = textureSizeInPixels
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

        this._gl.texImage3D(
            this._gl.TEXTURE_2D_ARRAY,
            0,
            this._gl.RGBA,
            textureSizeInPixels,
            textureSizeInPixels,
            maxTextureCount,
            0,
            this._gl.RGBA,
            this._gl.UNSIGNED_BYTE,
            new Uint8Array(textureSizeInPixels * textureSizeInPixels * maxTextureCount * 4),
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
        if (this._currentTextureChangedSinceLastUpload) {
            this._gl.bindTexture(this._gl.TEXTURE_2D_ARRAY, this._texture)
            this._gl.texSubImage3D(
                this._gl.TEXTURE_2D_ARRAY,
                0,
                0,
                0,
                this._currentTextureIndex,
                textureSizeInPixels,
                textureSizeInPixels,
                1,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                this._glyphContext.canvas,
            )
            this._currentTextureChangedSinceLastUpload = false
        }
    }

    private _switchToNextTexture() {
        if (this._currentTextureIndex >= this._gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) {
            throw new Error(
                "The WebGL renderer ran out of texture space. Please re-open the editor or switch to a different renderer.",
            )
        }

        console.warn("switching to next texture #", this._currentTextureIndex + 2)

        this.uploadTexture()

        this._glyphContext.fillStyle = backgroundColor
        this._glyphContext.fillRect(
            0,
            0,
            this._glyphContext.canvas.width,
            this._glyphContext.canvas.width,
        )
        this._glyphContext.fillStyle = foregroundColor
        this._currentTextureIndex++
        this._nextX = 0
        this._nextY = 0
        this._currentTextureChangedSinceLastUpload = true
    }

    private _rasterizeGlyph(text: string, variantIndex: number) {
        this._currentTextureChangedSinceLastUpload = true

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

        if ((this._nextX + width) * devicePixelRatio > textureSizeInPixels) {
            this._nextX = 0
            this._nextY = Math.ceil(this._nextY + height)
        }

        if ((this._nextY + height) * devicePixelRatio > textureSizeInPixels) {
            this._switchToNextTexture()
        }

        const x = this._nextX
        const y = this._nextY
        this._glyphContext.fillText(text, x + variantOffset, y + linePaddingInPixels / 2)
        this._nextX += width

        return {
            width: width * devicePixelRatio,
            height: height * devicePixelRatio,
            textureIndex: this._currentTextureIndex,
            textureU: x * devicePixelRatio / textureSizeInPixels,
            textureV: y * devicePixelRatio / textureSizeInPixels,
            textureWidth: width * devicePixelRatio / textureSizeInPixels,
            textureHeight: height * devicePixelRatio / textureSizeInPixels,
            subpixelWidth: subpixelWidth * devicePixelRatio,
            variantOffset,
        } as WebGLGlyph
    }
}
