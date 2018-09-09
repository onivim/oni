import { IRasterizedGlyph } from "./IRasterizedGlyph"

const backgroundColor = "black"
const foregroundColor = "white"

export interface IGlyphAtlasOptions {
    fontFamily: string
    fontSize: string
    fontWeight: number | string
    lineHeightInPixels: number
    linePaddingInPixels: number
    glyphPaddingInPixels: number
    devicePixelRatio: number
    offsetGlyphVariantCount: number
    textureSizeInPixels: number
    textureLayerCount: number
}

export class WebGLTextureSpaceExceededError extends Error {}

export class GlyphAtlas {
    private _rasterizingContext: CanvasRenderingContext2D
    private _rasterizedGlyphs = new Map<string, IRasterizedGlyph[][]>()
    private _texture: WebGLTexture
    private _currentTextureLayerIndex = 0
    private _currentTextureLayerChangedSinceLastUpload = false
    private _nextX = 0
    private _nextY = 0

    constructor(private _gl: WebGL2RenderingContext, private _options: IGlyphAtlasOptions) {
        // TODO we should share at least the rasterizingCanvas and maybe even the texture among different buffers
        const rasterizingCanvas = document.createElement("canvas")
        rasterizingCanvas.width = this._options.textureSizeInPixels
        rasterizingCanvas.height = this._options.textureSizeInPixels
        this._rasterizingContext = rasterizingCanvas.getContext("2d", { alpha: false })
        this._rasterizingContext.fillStyle = foregroundColor
        this._rasterizingContext.textBaseline = "top"
        this._rasterizingContext.scale(_options.devicePixelRatio, _options.devicePixelRatio)
        this._rasterizingContext.imageSmoothingEnabled = false

        document.body.appendChild(rasterizingCanvas)

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

        this._prefillWithVisibleAsciiCharacters()
    }

    public getRasterizedGlyph(
        text: string,
        isBold: boolean,
        isItalic: boolean,
        variantIndex: number,
    ) {
        // The mapping goes from character to styles (bold etc.) to subpixel-offset variant,
        // e.g. this._glyphs.get("a")[0][0] is the regular "a" with 0 offset,
        // while this._glyphs.get("a")[3][1] is the bold italic "a" with 1/offsetGlyphVariantCount px offset
        let glyphStyleVariants = this._rasterizedGlyphs.get(text)
        if (!glyphStyleVariants) {
            glyphStyleVariants = new Array<IRasterizedGlyph[]>(glyphStyleCount)
            this._rasterizedGlyphs.set(text, glyphStyleVariants)
        }
        const glyphStyleIndex = getGlyphStyleIndex(isBold, isItalic)
        let glyphOffsetVariants = glyphStyleVariants[glyphStyleIndex]
        if (!glyphOffsetVariants) {
            glyphOffsetVariants = new Array<IRasterizedGlyph>(this._options.offsetGlyphVariantCount)
            glyphStyleVariants[glyphStyleIndex] = glyphOffsetVariants
        }

        let rasterizedGlyph = glyphOffsetVariants[variantIndex]
        if (!rasterizedGlyph) {
            rasterizedGlyph = this._rasterizeGlyph(text, isBold, isItalic, variantIndex)
            glyphOffsetVariants[variantIndex] = rasterizedGlyph
        }

        return rasterizedGlyph
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
                this._rasterizingContext.canvas,
            )
            this._currentTextureLayerChangedSinceLastUpload = false
        }
    }

    private _rasterizeGlyph(
        text: string,
        isBold: boolean,
        isItalic: boolean,
        variantIndex: number,
    ) {
        this._currentTextureLayerChangedSinceLastUpload = true

        const {
            fontWeight,
            devicePixelRatio,
            lineHeightInPixels,
            linePaddingInPixels,
            glyphPaddingInPixels,
            offsetGlyphVariantCount,
        } = this._options
        const style = getGlyphStyleString(fontWeight, isBold, isItalic)
        this._rasterizingContext.font = `${style} ${this._options.fontSize} ${
            this._options.fontFamily
        }`
        const variantOffset = variantIndex / offsetGlyphVariantCount

        const height = lineHeightInPixels + 2 * glyphPaddingInPixels
        const { width: measuredGlyphWidth } = this._rasterizingContext.measureText(text)
        const width =
            Math.ceil(variantOffset) + Math.ceil(measuredGlyphWidth) + 2 * glyphPaddingInPixels

        if ((this._nextX + width) * devicePixelRatio > this._options.textureSizeInPixels) {
            this._nextX = 0
            this._nextY = Math.ceil(this._nextY + height)
        }

        if ((this._nextY + height) * devicePixelRatio > this._options.textureSizeInPixels) {
            this._switchToNextLayer()
        }

        const x = this._nextX
        const y = this._nextY
        this._rasterizingContext.fillText(
            text,
            x + glyphPaddingInPixels + variantOffset,
            y + glyphPaddingInPixels + linePaddingInPixels / 2,
        )
        this._nextX += width

        const rasterizedGlyph: IRasterizedGlyph = {
            width: width * devicePixelRatio,
            height: height * devicePixelRatio,
            textureLayerIndex: this._currentTextureLayerIndex,
            textureU: x * devicePixelRatio / this._options.textureSizeInPixels,
            textureV: y * devicePixelRatio / this._options.textureSizeInPixels,
            textureWidth: width * devicePixelRatio / this._options.textureSizeInPixels,
            textureHeight: height * devicePixelRatio / this._options.textureSizeInPixels,
            variantOffset,
        }
        return rasterizedGlyph
    }

    private _switchToNextLayer() {
        if (this._currentTextureLayerIndex + 1 >= this._options.textureLayerCount) {
            throw new WebGLTextureSpaceExceededError(
                "The WebGL renderer ran out of texture space. Please re-open the editor " +
                    "with more texture layers or switch to a different renderer.",
            )
        }

        this.uploadTexture()

        this._rasterizingContext.fillStyle = backgroundColor
        this._rasterizingContext.fillRect(
            0,
            0,
            this._rasterizingContext.canvas.width,
            this._rasterizingContext.canvas.width,
        )
        this._rasterizingContext.fillStyle = foregroundColor
        this._currentTextureLayerIndex++
        this._nextX = 0
        this._nextY = 0
        this._currentTextureLayerChangedSinceLastUpload = true
    }

    private _prefillWithVisibleAsciiCharacters() {
        for (let asciiCode = 33; asciiCode <= 126; asciiCode++) {
            const character = String.fromCharCode(asciiCode)

            for (
                let variantIndex = 0;
                variantIndex < this._options.offsetGlyphVariantCount;
                variantIndex++
            ) {
                this.getRasterizedGlyph(character, false, false, variantIndex)
                this.getRasterizedGlyph(character, true, false, variantIndex)
                this.getRasterizedGlyph(character, false, true, variantIndex)
                this.getRasterizedGlyph(character, true, true, variantIndex)
            }
        }
    }
}

const defaultFontWeight = 400

const getGlyphStyleString = (
    baseFontWeight: number | string = defaultFontWeight,
    isBold: boolean,
    isItalic: boolean,
) => {
    const fontWeight = isBold
        ? getIncreasedFontWeightForBoldText(baseFontWeight)
        : baseFontWeight || defaultFontWeight
    return fontWeight + (isItalic ? " italic" : "")
}

const addedFontWeightForBoldText = 300
const maxFontWeight = 900

const getIncreasedFontWeightForBoldText = (baseFontWeight: number | string) => {
    const numericBaseFontWeight = getNumericFontWeight(baseFontWeight)
    return Math.min(numericBaseFontWeight + addedFontWeightForBoldText, maxFontWeight)
}

const getNumericFontWeight = (fontWeight: number | string) => {
    if (typeof fontWeight === "number") {
        return fontWeight
    } else {
        return numericFontWeightMap[fontWeight] || defaultFontWeight
    }
}

const numericFontWeightMap = {
    normal: 400,
    bold: 700,
    // The following two should in fact be dynamic based on the weight of other elements
    // but this is too complex and not relevant enough to warrant respecting this logic
    bolder: 700,
    lighter: 300,
}

const glyphStyleCount = 4
const getGlyphStyleIndex = (isBold: boolean, isItalic: boolean) =>
    isBold ? (isItalic ? 3 : 1) : isItalic ? 2 : 0
