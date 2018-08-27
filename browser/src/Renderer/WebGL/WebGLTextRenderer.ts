import { ICell } from "../../neovim"
import { CellGroup } from "./CellGroup"
import { LigatureGrouper } from "./LigatureGrouper"
import { IWebGLAtlasOptions, WebGLAtlas, WebGLGlyph } from "./WebGLAtlas"
import {
    createProgram,
    createUnitQuadElementIndicesBuffer,
    createUnitQuadVerticesBuffer,
} from "./WebGLUtilities"
import { normalizeColor } from "./normalizeColor"

const glyphInstanceFieldCount = 13
const glyphInstanceSizeInBytes = glyphInstanceFieldCount * Float32Array.BYTES_PER_ELEMENT

const vertexShaderAttributes = {
    unitQuadVertex: 0,
    targetOrigin: 1,
    targetSize: 2,
    textColorRGBA: 3,
    atlasLayerIndex: 4,
    atlasOrigin: 5,
    atlasSize: 6,
}

const vertexShaderSource = `
    #version 300 es

    layout (location = 0) in vec2 unitQuadVertex;
    layout (location = 1) in vec2 targetOrigin;
    layout (location = 2) in vec2 targetSize;
    layout (location = 3) in vec4 textColorRGBA;
    layout (location = 4) in float atlasLayerIndex;
    layout (location = 5) in vec2 atlasOrigin;
    layout (location = 6) in vec2 atlasSize;

    uniform vec2 viewportScale;

    flat out vec4 textColor;
    flat out int convertedAtlasLayerIndex;
    out vec2 atlasPosition;

    void main() {
        vec2 targetPixelPosition = targetOrigin + unitQuadVertex * targetSize;
        vec2 targetPosition = targetPixelPosition * viewportScale + vec2(-1.0, 1.0);
        gl_Position = vec4(targetPosition, 0.0, 1.0);
        textColor = textColorRGBA;
        convertedAtlasLayerIndex = int(atlasLayerIndex);
        atlasPosition = atlasOrigin + unitQuadVertex * atlasSize;
    }
`.trim()

const firstPassFragmentShaderSource = `
    #version 300 es

    precision mediump float;
    precision mediump sampler2DArray;

    layout(location = 0) out vec4 outColor;
    flat in vec4 textColor;
    flat in int convertedAtlasLayerIndex;
    in vec2 atlasPosition;

    uniform sampler2DArray atlasTextures;

    void main() {
      vec4 atlasColor = texture(atlasTextures, vec3(atlasPosition, convertedAtlasLayerIndex));
      outColor = textColor.a * atlasColor;
    }
`.trim()

const secondPassFragmentShaderSource = `
    #version 300 es

    precision mediump float;
    precision mediump sampler2DArray;

    layout(location = 0) out vec4 outColor;
    flat in vec4 textColor;
    flat in int convertedAtlasLayerIndex;
    in vec2 atlasPosition;

    uniform sampler2DArray atlasTextures;

    void main() {
        vec3 atlasColor = texture(atlasTextures, vec3(atlasPosition, convertedAtlasLayerIndex)).rgb;
        vec3 outColorRGB = atlasColor * textColor.rgb;
        float outColorA = max(outColorRGB.r, max(outColorRGB.g, outColorRGB.b));
        outColor = vec4(outColorRGB, outColorA);
    }
`.trim()

// const isWhiteSpace = (text: string) => text === null || text === "" || text === " "

export class WebGlTextRenderer {
    private _atlas: WebGLAtlas
    private _glyphOverlapInPixels: number
    private _subpixelDivisor: number
    private _devicePixelRatio: number

    private _firstPassProgram: WebGLProgram
    private _firstPassViewportScaleLocation: WebGLUniformLocation
    private _firstPassAtlasTexturesLocation: WebGLUniformLocation
    private _secondPassProgram: WebGLProgram
    private _secondPassViewportScaleLocation: WebGLUniformLocation
    private _secondPassAtlasTexturesLocation: WebGLUniformLocation
    private _unitQuadVerticesBuffer: WebGLBuffer
    private _unitQuadElementIndicesBuffer: WebGLBuffer
    private _glyphInstances: Float32Array
    private _glyphInstancesBuffer: WebGLBuffer
    private _vertexArrayObject: WebGLVertexArrayObject

    constructor(
        private _gl: WebGL2RenderingContext,
        private _ligatureGrouper: LigatureGrouper,
        atlasOptions: IWebGLAtlasOptions,
    ) {
        this._glyphOverlapInPixels = atlasOptions.glyphPaddingInPixels
        this._subpixelDivisor = atlasOptions.offsetGlyphVariantCount
        this._devicePixelRatio = atlasOptions.devicePixelRatio
        this._atlas = new WebGLAtlas(this._gl, atlasOptions)

        this._firstPassProgram = createProgram(
            this._gl,
            vertexShaderSource,
            firstPassFragmentShaderSource,
        )
        this._secondPassProgram = createProgram(
            this._gl,
            vertexShaderSource,
            secondPassFragmentShaderSource,
        )

        this._firstPassViewportScaleLocation = this._gl.getUniformLocation(
            this._firstPassProgram,
            "viewportScale",
        )
        this._secondPassViewportScaleLocation = this._gl.getUniformLocation(
            this._secondPassProgram,
            "viewportScale",
        )

        this._firstPassAtlasTexturesLocation = this._gl.getUniformLocation(
            this._firstPassProgram,
            "atlasTextures",
        )
        this._secondPassAtlasTexturesLocation = this._gl.getUniformLocation(
            this._secondPassProgram,
            "atlasTextures",
        )

        this.createBuffers()
        this.createVertexArrayObject()
    }

    public draw(
        columnCount: number,
        rowCount: number,
        getCell: (columnIndex: number, rowIndex: number) => ICell,
        fontWidthInPixels: number,
        fontHeightInPixels: number,
        defaultForegroundColor: string,
        viewportScaleX: number,
        viewportScaleY: number,
    ) {
        const cellCount = columnCount * rowCount
        this.recreateGlyphInstancesArrayIfRequired(cellCount)
        const glyphInstanceCount = this.populateGlyphInstances(
            columnCount,
            rowCount,
            getCell,
            fontWidthInPixels,
            fontHeightInPixels,
            defaultForegroundColor,
        )
        this.drawGlyphInstances(glyphInstanceCount, viewportScaleX, viewportScaleY)
    }

    private createBuffers() {
        this._unitQuadVerticesBuffer = createUnitQuadVerticesBuffer(this._gl)
        this._unitQuadElementIndicesBuffer = createUnitQuadElementIndicesBuffer(this._gl)
        this._glyphInstancesBuffer = this._gl.createBuffer()
    }

    private createVertexArrayObject() {
        this._vertexArrayObject = this._gl.createVertexArray()
        this._gl.bindVertexArray(this._vertexArrayObject)

        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._unitQuadElementIndicesBuffer)

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._unitQuadVerticesBuffer)
        this._gl.enableVertexAttribArray(vertexShaderAttributes.unitQuadVertex)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.unitQuadVertex,
            2,
            this._gl.FLOAT,
            false,
            0,
            0,
        )

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._glyphInstancesBuffer)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.targetOrigin)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.targetOrigin,
            2,
            this._gl.FLOAT,
            false,
            glyphInstanceSizeInBytes,
            0,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.targetOrigin, 1)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.targetSize)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.targetSize,
            2,
            this._gl.FLOAT,
            false,
            glyphInstanceSizeInBytes,
            2 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.targetSize, 1)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.textColorRGBA)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.textColorRGBA,
            4,
            this._gl.FLOAT,
            false,
            glyphInstanceSizeInBytes,
            4 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.textColorRGBA, 1)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.atlasLayerIndex)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.atlasLayerIndex,
            1,
            this._gl.FLOAT,
            false,
            glyphInstanceSizeInBytes,
            8 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.atlasLayerIndex, 1)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.atlasOrigin)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.atlasOrigin,
            2,
            this._gl.FLOAT,
            false,
            glyphInstanceSizeInBytes,
            9 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.atlasOrigin, 1)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.atlasSize)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.atlasSize,
            2,
            this._gl.FLOAT,
            false,
            glyphInstanceSizeInBytes,
            11 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.atlasSize, 1)
    }

    private recreateGlyphInstancesArrayIfRequired(cellCount: number) {
        const requiredArrayLength = cellCount * glyphInstanceFieldCount
        if (!this._glyphInstances || this._glyphInstances.length < requiredArrayLength) {
            this._glyphInstances = new Float32Array(requiredArrayLength)
        }
    }

    private populateGlyphInstances(
        columnCount: number,
        rowCount: number,
        getCell: (columnIndex: number, rowIndex: number) => ICell,
        fontWidthInPixels: number,
        fontHeightInPixels: number,
        defaultForegroundColor: string,
    ) {
        const pixelRatioAdaptedFontWidth = fontWidthInPixels * this._devicePixelRatio
        const pixelRatioAdaptedFontHeight = fontHeightInPixels * this._devicePixelRatio
        const pixelRatioAdaptedGlyphOverlap = this._glyphOverlapInPixels * this._devicePixelRatio

        let glyphCount = 0
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            const cellGroups: CellGroup[] = []
            for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
                const currentCell = getCell(columnIndex, rowIndex)
                const currentCharacter = currentCell.character
                const currentCellGroup = cellGroups.length && cellGroups[cellGroups.length - 1]
                if (!currentCharacter || currentCharacter === " ") {
                    continue
                } else if (
                    !currentCellGroup ||
                    currentCellGroup.foregroundColor !== currentCell.foregroundColor ||
                    currentCellGroup.backgroundColor !== currentCell.backgroundColor ||
                    currentCellGroup.bold !== currentCell.bold ||
                    currentCellGroup.italic !== currentCell.italic ||
                    currentCellGroup.underline !== currentCell.underline ||
                    currentCellGroup.startColumnIndex + currentCellGroup.characters.length <
                        columnIndex // We have been skipping whitespace
                ) {
                    const {
                        character,
                        foregroundColor,
                        backgroundColor,
                        bold,
                        italic,
                        underline,
                    } = currentCell
                    cellGroups.push({
                        startColumnIndex: columnIndex,
                        characters: [character],
                        foregroundColor,
                        backgroundColor,
                        bold,
                        italic,
                        underline,
                    })
                } else {
                    currentCellGroup.characters.push(currentCharacter)
                }
            }

            cellGroups.forEach(cellGroup => {
                const { startColumnIndex, characters, bold, italic, foregroundColor } = cellGroup

                const ligatureGroups = this._ligatureGrouper.getLigatureGroups(characters)

                let offsetWithinCellGroup = 0
                ligatureGroups.forEach(ligatureGroup => {
                    const columnIndex = startColumnIndex + offsetWithinCellGroup
                    const x = pixelRatioAdaptedFontWidth * columnIndex
                    const y = pixelRatioAdaptedFontHeight * rowIndex
                    const variantIndex =
                        Math.round(x * this._subpixelDivisor) % this._subpixelDivisor
                    const glyph = this._atlas.getGlyph(ligatureGroup, bold, italic, variantIndex)
                    const colorToUse = foregroundColor || defaultForegroundColor || "white"
                    const normalizedTextColor = normalizeColor(colorToUse)

                    this.updateGlyphInstance(
                        glyphCount,
                        Math.round(x - glyph.variantOffset) - pixelRatioAdaptedGlyphOverlap,
                        y - pixelRatioAdaptedGlyphOverlap,
                        glyph,
                        normalizedTextColor,
                    )

                    offsetWithinCellGroup += ligatureGroup.length
                    glyphCount++
                })
            })
        }

        this._atlas.uploadTexture()

        return glyphCount
    }

    private drawGlyphInstances(glyphCount: number, viewportScaleX: number, viewportScaleY: number) {
        this._gl.bindVertexArray(this._vertexArrayObject)
        this._gl.enable(this._gl.BLEND)

        this._gl.useProgram(this._firstPassProgram)

        this._gl.uniform2f(this._firstPassViewportScaleLocation, viewportScaleX, viewportScaleY)
        this._gl.uniform1i(this._firstPassAtlasTexturesLocation, 0)

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._glyphInstancesBuffer)
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._glyphInstances, this._gl.STREAM_DRAW)

        this._gl.blendFuncSeparate(
            this._gl.ZERO,
            this._gl.ONE_MINUS_SRC_COLOR,
            this._gl.ZERO,
            this._gl.ONE,
        )
        this._gl.drawElementsInstanced(this._gl.TRIANGLES, 6, this._gl.UNSIGNED_BYTE, 0, glyphCount)

        this._gl.useProgram(this._secondPassProgram)

        this._gl.blendFuncSeparate(
            this._gl.ONE,
            this._gl.ONE,
            this._gl.ONE,
            this._gl.ONE_MINUS_SRC_ALPHA,
        )

        this._gl.uniform2f(this._secondPassViewportScaleLocation, viewportScaleX, viewportScaleY)
        this._gl.uniform1i(this._secondPassAtlasTexturesLocation, 0)

        this._gl.drawElementsInstanced(this._gl.TRIANGLES, 6, this._gl.UNSIGNED_BYTE, 0, glyphCount)
    }

    private updateGlyphInstance(
        index: number,
        x: number,
        y: number,
        glyph: WebGLGlyph,
        color: Float32Array,
    ) {
        const startOffset = glyphInstanceFieldCount * index
        // targetOrigin
        this._glyphInstances[0 + startOffset] = x
        this._glyphInstances[1 + startOffset] = y
        // targetSize
        this._glyphInstances[2 + startOffset] = glyph.width
        this._glyphInstances[3 + startOffset] = glyph.height
        // textColorRGBA
        this._glyphInstances[4 + startOffset] = color[0]
        this._glyphInstances[5 + startOffset] = color[1]
        this._glyphInstances[6 + startOffset] = color[2]
        this._glyphInstances[7 + startOffset] = color[3]
        // atlasLayerIndex
        this._glyphInstances[8 + startOffset] = glyph.textureLayerIndex
        // atlasOrigin
        this._glyphInstances[9 + startOffset] = glyph.textureU
        this._glyphInstances[10 + startOffset] = glyph.textureV
        // atlasSize
        this._glyphInstances[11 + startOffset] = glyph.textureWidth
        this._glyphInstances[12 + startOffset] = glyph.textureHeight
    }
}
