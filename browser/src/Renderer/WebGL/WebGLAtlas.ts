const defaultTextureSizeInPixels = 512
const glyphPaddingInPixels = 2

export interface IWebGLAtlasOptions {
    fontFamily: string
    fontSize: string
    lineHeight: number
    devicePixelRatio: number
    subpixelDivisor: number
}

export interface WebGLGlyph {
    width: number
    height: number
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
    private _nextX = 0
    private _nextY = 0
    private _textureChangedSinceLastUpload = false
    private _texture: WebGLTexture
    private _textureSize: number
    private _uvScale: number

    constructor(private _gl: WebGL2RenderingContext, private _options: IWebGLAtlasOptions) {
        this._textureSize = defaultTextureSizeInPixels * _options.devicePixelRatio
        this._uvScale = 1 / this._textureSize

        const glyphCanvas = document.createElement("canvas")
        glyphCanvas.width = this._textureSize
        glyphCanvas.height = this._textureSize
        this._glyphContext = glyphCanvas.getContext("2d", { alpha: false })
        this._glyphContext.font = `${this._options.fontSize} ${this._options.fontFamily}`
        this._glyphContext.fillStyle = "white"
        // this.glyphCtx.textBaseline = "bottom"
        this._glyphContext.textBaseline = "top"
        this._glyphContext.scale(_options.devicePixelRatio, _options.devicePixelRatio)
        this._glyphContext.imageSmoothingEnabled = false

        this._texture = _gl.createTexture()
        _gl.bindTexture(_gl.TEXTURE_2D, this._texture)
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR)
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE)
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE)
        this._textureChangedSinceLastUpload = true
        this.uploadTexture()
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
        if (this._textureChangedSinceLastUpload) {
            this._gl.texImage2D(
                this._gl.TEXTURE_2D,
                0,
                this._gl.RGBA,
                this._textureSize,
                this._textureSize,
                0,
                this._gl.RGBA,
                this._gl.UNSIGNED_BYTE,
                this._glyphContext.canvas,
            )
            this._textureChangedSinceLastUpload = false
        }
    }

    private _rasterizeGlyph(text: string, variantIndex: number) {
        this._textureChangedSinceLastUpload = true

        const { devicePixelRatio, lineHeight, subpixelDivisor } = this._options
        const variantOffset = variantIndex / subpixelDivisor

        const height = lineHeight
        const { width: subpixelWidth } = this._glyphContext.measureText(text)
        const width = Math.ceil(variantOffset) + Math.ceil(subpixelWidth)

        if ((this._nextX + width) * devicePixelRatio > this._textureSize) {
            this._nextX = 0
            this._nextY = Math.ceil(this._nextY + height + glyphPaddingInPixels)
        }

        if ((this._nextY + height) * devicePixelRatio > this._textureSize) {
            // TODO implement a fallback instead of just throwing
            throw new Error("Texture is too small")
        }

        const x = this._nextX
        const y = this._nextY
        // TODO fix the 1px offset in comparison to the cursor content
        // this.glyphCtx.fillText(text, x + variantOffset, y + height)
        this._glyphContext.fillText(text, x + variantOffset, y)
        this._nextX += width

        return {
            textureU: x * devicePixelRatio * this._uvScale,
            textureV: y * devicePixelRatio * this._uvScale,
            textureWidth: width * devicePixelRatio * this._uvScale,
            textureHeight: height * devicePixelRatio * this._uvScale,
            width: width * devicePixelRatio,
            height: height * devicePixelRatio,
            subpixelWidth: subpixelWidth * devicePixelRatio,
            variantOffset,
        } as WebGLGlyph
    }
}
