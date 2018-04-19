const TEXTURE_SIZE = 512

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

export class Atlas {
    private glyphCanvas: HTMLCanvasElement
    private glyphCtx: CanvasRenderingContext2D
    private glyphPadding = 2
    private glyphs = new Map<string, Map<number, WebGLGlyph>>()
    private nextX = 0
    private nextY = 0
    private textureChangedSinceLastUpload = false
    private texture: WebGLTexture
    private textureSize: number
    private uvScale: number

    constructor(private gl: WebGL2RenderingContext, private options: IWebGLAtlasOptions) {
        this.textureSize = TEXTURE_SIZE * options.devicePixelRatio
        this.uvScale = 1 / this.textureSize

        this.glyphCanvas = document.createElement("canvas")
        this.glyphCanvas.style.backgroundColor = "red"
        this.glyphCanvas.width = this.textureSize
        this.glyphCanvas.height = this.textureSize
        this.glyphCtx = this.glyphCanvas.getContext("2d", { alpha: false })
        this.glyphCtx.font = `${this.options.fontSize} ${this.options.fontFamily}`
        this.glyphCtx.fillStyle = "white"
        // this.glyphCtx.textBaseline = "bottom"
        this.glyphCtx.textBaseline = "top"
        this.glyphCtx.scale(options.devicePixelRatio, options.devicePixelRatio)
        this.glyphCtx.imageSmoothingEnabled = false

        this.texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.textureSize,
            this.textureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this.glyphCanvas,
        )
        document.body.appendChild(this.glyphCanvas)
        // this.glyphCanvas.style.position = "absolute"
        // this.glyphCanvas.style.top = "0"
        // this.glyphCanvas.style.right = "0"
    }

    public getGlyph(text: string, variantIndex: number) {
        let glyphVariants = this.glyphs.get(text)
        if (!glyphVariants) {
            glyphVariants = new Map()
            this.glyphs.set(text, glyphVariants)
        }

        let glyph = glyphVariants.get(variantIndex)
        if (!glyph) {
            glyph = this.rasterizeGlyph(text, variantIndex)
            glyphVariants.set(variantIndex, glyph)
        }

        return glyph
    }

    public uploadTexture() {
        if (this.textureChangedSinceLastUpload) {
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.textureSize,
                this.textureSize,
                0,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                this.glyphCanvas,
            )
            this.textureChangedSinceLastUpload = false
        }
    }

    private rasterizeGlyph(text: string, variantIndex: number) {
        this.textureChangedSinceLastUpload = true

        const { devicePixelRatio, lineHeight, subpixelDivisor } = this.options
        const variantOffset = variantIndex / subpixelDivisor

        const height = lineHeight
        const { width: subpixelWidth } = this.glyphCtx.measureText(text)
        const width = Math.ceil(variantOffset) + Math.ceil(subpixelWidth)

        if ((this.nextX + width) * devicePixelRatio > this.textureSize) {
            this.nextX = 0
            this.nextY = Math.ceil(this.nextY + height + this.glyphPadding)
        }

        if ((this.nextY + height) * devicePixelRatio > this.textureSize) {
            throw new Error("Texture is too small")
        }

        const x = this.nextX
        const y = this.nextY
        // this.glyphCtx.fillText(text, x + variantOffset, y + height)
        this.glyphCtx.fillText(text, x + variantOffset, y)
        this.nextX += width

        return {
            textureU: x * devicePixelRatio * this.uvScale,
            textureV: y * devicePixelRatio * this.uvScale,
            textureWidth: width * devicePixelRatio * this.uvScale,
            textureHeight: height * devicePixelRatio * this.uvScale,
            width: width * devicePixelRatio,
            height: height * devicePixelRatio,
            subpixelWidth: subpixelWidth * devicePixelRatio,
            variantOffset,
        } as WebGLGlyph
    }
}
