const defaultTextureSizeInPixels = 512
const glyphPaddingInPixels = 0

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
    textureWidth: number
    textureHeight: number
    textureU: number
    textureV: number
    variantOffset: number
    subpixelWidth: number
}

export class WebGLAtlas {
    private _glyphContext: CanvasRenderingContext2D
    private _glyphs = new Map<string, WebGLGlyph[][]>()
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
        this._glyphContext.fillStyle = "white"
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

    public getGlyph(text: string, isBold: boolean, isItalic: boolean, variantIndex: number) {
        // The mapping goes from character to styles (bold etc.) to subpixel-offset variant,
        // e.g. this._glyphs.get("a")[0][0] is the regular "a" with 0 offset,
        // while this._glyphs.get("a")[3][1] is the bold italic "a" with 1/offsetGlyphVariantCount px offset
        let glyphStyleVariants = this._glyphs.get(text)
        if (!glyphStyleVariants) {
            glyphStyleVariants = new Array<WebGLGlyph[]>(glyphStyles.length)
            this._glyphs.set(text, glyphStyleVariants)
        }
        const glyphStyleIndex = getGlyphStyleIndex(isBold, isItalic)
        let glyphOffsetVariants = glyphStyleVariants[glyphStyleIndex]
        if (!glyphOffsetVariants) {
            glyphOffsetVariants = new Array<WebGLGlyph>(this._options.offsetGlyphVariantCount)
            glyphStyleVariants[glyphStyleIndex] = glyphOffsetVariants
        }

        let glyph = glyphOffsetVariants[variantIndex]
        if (!glyph) {
            glyph = this._rasterizeGlyph(text, isBold, isItalic, variantIndex)
            glyphOffsetVariants[variantIndex] = glyph
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

    private _rasterizeGlyph(
        text: string,
        isBold: boolean,
        isItalic: boolean,
        variantIndex: number,
    ) {
        this._textureChangedSinceLastUpload = true

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
        const style = getGlyphStyleString(isBold, isItalic)
        this._glyphContext.font = `${style} ${this._options.fontSize} ${this._options.fontFamily}`
        this._glyphContext.fillText(text, x + variantOffset, y + linePaddingInPixels / 2)
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

const getGlyphStyleIndex = (isBold: boolean, isItalic: boolean) =>
    isBold ? (isItalic ? 3 : 1) : isItalic ? 2 : 0

const glyphStyles = [
    "", // regular, 0
    "bold", // 1
    "italic", // 2
    "bold italic", // 3
]
const getGlyphStyleString = (isBold: boolean, isItalic: boolean) =>
    glyphStyles[getGlyphStyleIndex(isBold, isItalic)]
