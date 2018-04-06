import * as normalizeColor from "color-normalize"
import { ICell, IScreen } from "../../neovim"
import { Atlas, IWebGLAtlasOptions, WebGLGlyph } from "./WebGLAtlas"
import * as shaders from "./WebGLShaders"

const UNIT_QUAD_VERTICES = new Float32Array([1, 1, 1, 0, 0, 0, 0, 1])
const UNIT_QUAD_ELEMENT_INDICES = new Uint8Array([0, 1, 3, 1, 2, 3])
// tslint:disable-next-line:no-bitwise
const MAX_GLYPH_INSTANCES = 1 << 14 // TODO find a reasonable way of determining this
const GLYPH_INSTANCE_FIELD_COUNT = 12
const GLYPH_INSTANCE_SIZE_IN_BYTES = GLYPH_INSTANCE_FIELD_COUNT * Float32Array.BYTES_PER_ELEMENT
export const SUBPIXEL_DIVISOR = 10 // TODO move this somewhere else

export class WebGLRenderer {
    private _devicePixelRatio: number
    private _gl: WebGL2RenderingContext
    private _atlas: Atlas
    // private textBlendPass1Program: WebGLProgram
    // private textBlendPass2Program: WebGLProgram
    // private textBlendPass1ViewportScaleLocation: WebGLUniformLocation
    // private textBlendPass2ViewportScaleLocation: WebGLUniformLocation
    private textSinglePassProgram: WebGLProgram
    private textSinglePassViewportScaleLocation: WebGLUniformLocation
    private textBlendVAO: WebGLVertexArrayObject
    private unitQuadVerticesBuffer: WebGLBuffer
    private unitQuadElementIndicesBuffer: WebGLBuffer
    private glyphInstances: Float32Array
    private glyphInstancesBuffer: WebGLBuffer

    constructor(canvasElement: HTMLCanvasElement, atlasOptions: IWebGLAtlasOptions) {
        this._devicePixelRatio = atlasOptions.devicePixelRatio
        this._gl = canvasElement.getContext("webgl2")
        this._atlas = new Atlas(this._gl, atlasOptions)
        this._gl.enable(this._gl.BLEND)

        const textBlendVertexShader = this.createShader(
            shaders.textBlendVertex,
            this._gl.VERTEX_SHADER,
        )
        // const textBlendPass1FragmentShader = this.createShader(
        //     shaders.textBlendPass1Fragment,
        //     this._gl.FRAGMENT_SHADER,
        // )
        // const textBlendPass2FragmentShader = this.createShader(
        //     shaders.textBlendPass2Fragment,
        //     this._gl.FRAGMENT_SHADER,
        // )

        // this.textBlendPass1Program = this.createProgram(
        //     textBlendVertexShader,
        //     textBlendPass1FragmentShader,
        // )
        // this.textBlendPass2Program = this.createProgram(
        //     textBlendVertexShader,
        //     textBlendPass2FragmentShader,
        // )

        // this.textBlendPass1ViewportScaleLocation = this._gl.getUniformLocation(
        //     this.textBlendPass1Program,
        //     "viewportScale",
        // )
        // this.textBlendPass2ViewportScaleLocation = this._gl.getUniformLocation(
        //     this.textBlendPass2Program,
        //     "viewportScale",
        // )

        const textSinglePassFragmentShader = this.createShader(
            shaders.textSinglePassFragment,
            this._gl.FRAGMENT_SHADER,
        )
        this.textSinglePassProgram = this.createProgram(
            textBlendVertexShader,
            textSinglePassFragmentShader,
        )
        this.textSinglePassViewportScaleLocation = this._gl.getUniformLocation(
            this.textSinglePassProgram,
            "viewportScale",
        )

        this.createBuffers()
        this.textBlendVAO = this.createTextBlendVAO()
    }

    public draw({
        width: columnCount,
        height: rowCount,
        // TODO font width and height are already defined in the atlas options and might conflict with them
        fontWidthInPixels,
        fontHeightInPixels,
        linePaddingInPixels,
        getCell,
        foregroundColor,
    }: IScreen) {
        // const canvasWidth = columnCount * fontWidthInPixels * this._devicePixelRatio
        // const canvasHeight = rowCount * fontHeightInPixels * this._devicePixelRatio
        const canvasWidth = this._gl.canvas.width
        const canvasHeight = this._gl.canvas.height
        const viewportScaleX = 2 / canvasWidth
        const viewportScaleY = -2 / canvasHeight

        const glyphCount = this.populateGlyphInstances(
            columnCount,
            rowCount,
            getCell,
            fontWidthInPixels,
            fontHeightInPixels,
            linePaddingInPixels,
            foregroundColor,
        )
        this._atlas.uploadTexture()

        this._gl.clearColor(0, 0, 0, 0)
        this._gl.clear(this._gl.COLOR_BUFFER_BIT)
        this._gl.viewport(0, 0, canvasWidth, canvasHeight)

        this.drawText(glyphCount, viewportScaleX, viewportScaleY)
    }

    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = this._gl.createProgram()
        this._gl.attachShader(program, vertexShader)
        this._gl.attachShader(program, fragmentShader)
        this._gl.linkProgram(program)
        if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
            const info = this._gl.getProgramInfoLog(program)
            throw new Error("Could not compile WebGL program: \n\n" + info)
        }
        return program
    }

    private createShader(source: string, type: number) {
        const shader = this._gl.createShader(type)
        this._gl.shaderSource(shader, source)
        this._gl.compileShader(shader)

        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            const info = this._gl.getShaderInfoLog(shader)
            throw new Error("Could not compile WebGL program: \n\n" + info)
        }

        return shader
    }

    private createBuffers() {
        this.unitQuadVerticesBuffer = this._gl.createBuffer()
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this.unitQuadVerticesBuffer)
        this._gl.bufferData(this._gl.ARRAY_BUFFER, UNIT_QUAD_VERTICES, this._gl.STATIC_DRAW)

        this.unitQuadElementIndicesBuffer = this._gl.createBuffer()
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this.unitQuadElementIndicesBuffer)
        this._gl.bufferData(
            this._gl.ELEMENT_ARRAY_BUFFER,
            UNIT_QUAD_ELEMENT_INDICES,
            this._gl.STATIC_DRAW,
        )

        this.glyphInstances = new Float32Array(MAX_GLYPH_INSTANCES * GLYPH_INSTANCE_FIELD_COUNT)
        this.glyphInstancesBuffer = this._gl.createBuffer()
    }

    private createTextBlendVAO() {
        const vao = this._gl.createVertexArray()
        this._gl.bindVertexArray(vao)

        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this.unitQuadElementIndicesBuffer)

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this.unitQuadVerticesBuffer)
        this._gl.enableVertexAttribArray(shaders.textBlendAttributes.unitQuadVertex)
        this._gl.vertexAttribPointer(
            shaders.textBlendAttributes.unitQuadVertex,
            2,
            this._gl.FLOAT,
            false,
            0,
            0,
        )

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this.glyphInstancesBuffer)

        this._gl.enableVertexAttribArray(shaders.textBlendAttributes.targetOrigin)
        this._gl.vertexAttribPointer(
            shaders.textBlendAttributes.targetOrigin,
            2,
            this._gl.FLOAT,
            false,
            GLYPH_INSTANCE_SIZE_IN_BYTES,
            0,
        )
        this._gl.vertexAttribDivisor(shaders.textBlendAttributes.targetOrigin, 1)

        this._gl.enableVertexAttribArray(shaders.textBlendAttributes.targetSize)
        this._gl.vertexAttribPointer(
            shaders.textBlendAttributes.targetSize,
            2,
            this._gl.FLOAT,
            false,
            GLYPH_INSTANCE_SIZE_IN_BYTES,
            2 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(shaders.textBlendAttributes.targetSize, 1)

        this._gl.enableVertexAttribArray(shaders.textBlendAttributes.textColorRGBA)
        this._gl.vertexAttribPointer(
            shaders.textBlendAttributes.textColorRGBA,
            4,
            this._gl.FLOAT,
            false,
            GLYPH_INSTANCE_SIZE_IN_BYTES,
            4 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(shaders.textBlendAttributes.textColorRGBA, 1)

        this._gl.enableVertexAttribArray(shaders.textBlendAttributes.atlasOrigin)
        this._gl.vertexAttribPointer(
            shaders.textBlendAttributes.atlasOrigin,
            2,
            this._gl.FLOAT,
            false,
            GLYPH_INSTANCE_SIZE_IN_BYTES,
            8 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(shaders.textBlendAttributes.atlasOrigin, 1)

        this._gl.enableVertexAttribArray(shaders.textBlendAttributes.atlasSize)
        this._gl.vertexAttribPointer(
            shaders.textBlendAttributes.atlasSize,
            2,
            this._gl.FLOAT,
            false,
            GLYPH_INSTANCE_SIZE_IN_BYTES,
            10 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(shaders.textBlendAttributes.atlasSize, 1)

        return vao
    }

    private populateGlyphInstances(
        columnCount: number,
        rowCount: number,
        getCell: (columnIndex: number, rowIndex: number) => ICell,
        fontWidthInPixels: number,
        fontHeightInPixels: number,
        linePaddingInPixels: number,
        defaultForegroundColor: string,
    ) {
        const subpixelFontWidth = fontWidthInPixels * this._devicePixelRatio
        const subpixelFontHeight = fontHeightInPixels * this._devicePixelRatio
        // TODO find out if the existing implementation uses line padding in the wrong way
        // const subpixelLinePadding = linePaddingInPixels * this._devicePixelRatio

        let glyphCount = 0
        // let y = subpixelLinePadding / 2
        let y = 0

        // TODO refactor this to not be as reliant on mutations
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            let x = 0

            for (let columnIndex = 0; columnIndex <= columnCount; columnIndex++) {
                const cell = getCell(columnIndex, rowIndex)
                const char = cell.character
                const variantIndex = Math.round(x * SUBPIXEL_DIVISOR) % SUBPIXEL_DIVISOR
                const glyph = this._atlas.getGlyph(char, variantIndex)
                const colorToUse = cell.foregroundColor || defaultForegroundColor || "white"
                const normalizedTextColor = normalizeColor.call(null, colorToUse, "float32")

                this.updateGlyphInstance(
                    glyphCount,
                    Math.round(x - glyph.variantOffset), // TODO maybe remove the variantOffset here?
                    // x,
                    y,
                    glyph,
                    normalizedTextColor,
                )

                glyphCount++
                // x += glyph.subpixelWidth
                x += subpixelFontWidth
            }

            // y += subpixelFontHeight + subpixelLinePadding
            y += subpixelFontHeight
        }

        return glyphCount
    }

    private updateGlyphInstance(
        index: number,
        x: number,
        y: number,
        glyph: WebGLGlyph,
        color: Float32Array,
    ) {
        const startOffset = GLYPH_INSTANCE_FIELD_COUNT * index
        // targetOrigin
        this.glyphInstances[0 + startOffset] = x
        this.glyphInstances[1 + startOffset] = y
        // targetSize
        this.glyphInstances[2 + startOffset] = glyph.width
        this.glyphInstances[3 + startOffset] = glyph.height
        // textColorRGBA
        this.glyphInstances[4 + startOffset] = color[0]
        this.glyphInstances[5 + startOffset] = color[1]
        this.glyphInstances[6 + startOffset] = color[2]
        this.glyphInstances[7 + startOffset] = color[3]
        // atlasOrigin
        this.glyphInstances[8 + startOffset] = glyph.textureU
        this.glyphInstances[9 + startOffset] = glyph.textureV
        // atlasSize
        this.glyphInstances[10 + startOffset] = glyph.textureWidth
        this.glyphInstances[11 + startOffset] = glyph.textureHeight
    }

    private drawText(glyphCount: number, viewportScaleX: number, viewportScaleY: number) {
        this._gl.bindVertexArray(this.textBlendVAO)
        this._gl.enable(this._gl.BLEND)

        // this._gl.useProgram(this.textBlendPass1Program)
        // this._gl.uniform2f(this.textBlendPass1ViewportScaleLocation, viewportScaleX, viewportScaleY)
        // this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this.glyphInstancesBuffer)
        // this._gl.bufferData(this._gl.ARRAY_BUFFER, this.glyphInstances, this._gl.STREAM_DRAW)
        // this._gl.blendFuncSeparate(
        //     this._gl.ZERO,
        //     this._gl.ONE_MINUS_SRC_COLOR,
        //     this._gl.ZERO,
        //     this._gl.ONE,
        // )
        // this._gl.drawElementsInstanced(this._gl.TRIANGLES, 6, this._gl.UNSIGNED_BYTE, 0, glyphCount)

        // this._gl.useProgram(this.textBlendPass2Program)
        // this._gl.blendFuncSeparate(this._gl.ONE, this._gl.ONE, this._gl.ZERO, this._gl.ONE)
        // this._gl.uniform2f(this.textBlendPass2ViewportScaleLocation, viewportScaleX, viewportScaleY)
        // this._gl.drawElementsInstanced(this._gl.TRIANGLES, 6, this._gl.UNSIGNED_BYTE, 0, glyphCount)

        this._gl.useProgram(this.textSinglePassProgram)
        this._gl.uniform2f(this.textSinglePassViewportScaleLocation, viewportScaleX, viewportScaleY)
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this.glyphInstancesBuffer)
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this.glyphInstances, this._gl.STREAM_DRAW)
        this._gl.blendFunc(this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA)
        this._gl.drawElementsInstanced(this._gl.TRIANGLES, 6, this._gl.UNSIGNED_BYTE, 0, glyphCount)
    }
}
