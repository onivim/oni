import { ICell } from "../../neovim"
import { normalizeColor } from "./normalizeColor"
import {
    createProgram,
    createUnitQuadElementIndicesBuffer,
    createUnitQuadVerticesBuffer,
} from "./WebGLUtilities"

const solidInstanceFieldCount = 8
const solidInstanceSizeInBytes = solidInstanceFieldCount * Float32Array.BYTES_PER_ELEMENT

const vertexShaderAttributes = {
    unitQuadVertex: 0,
    targetOrigin: 1,
    targetSize: 2,
    colorRGBA: 3,
}

const vertexShaderSource = `
    #version 300 es

    layout (location = 0) in vec2 unitQuadVertex;
    layout (location = 1) in vec2 targetOrigin;
    layout (location = 2) in vec2 targetSize;
    layout (location = 3) in vec4 colorRGBA;
    flat out vec4 color;

    uniform vec2 viewportScale;

    void main() {
        vec2 targetPixelPosition = targetOrigin + unitQuadVertex * targetSize;
        vec2 targetPosition = targetPixelPosition * viewportScale + vec2(-1.0, 1.0);
        gl_Position = vec4(targetPosition, 0.0, 1.0);
        color = colorRGBA;
    }
`.trim()

const fragmentShaderSource = `
    #version 300 es

    precision mediump float;

    flat in vec4 color;
    layout (location = 0) out vec4 outColor;

    void main() {
        outColor = color;
    }
`.trim()

export class SolidRenderer {
    private _program: WebGLProgram
    private _viewportScaleLocation: WebGLUniformLocation
    private _unitQuadVerticesBuffer: WebGLBuffer
    private _unitQuadElementIndicesBuffer: WebGLBuffer
    private _solidInstances: Float32Array
    private _solidInstancesBuffer: WebGLBuffer
    private _vertexArrayObject: WebGLVertexArrayObject

    constructor(private _gl: WebGL2RenderingContext, private _devicePixelRatio: number) {
        this._program = createProgram(this._gl, vertexShaderSource, fragmentShaderSource)
        this._viewportScaleLocation = this._gl.getUniformLocation(this._program, "viewportScale")

        this._createBuffers()
        this._createVertexArrayObject()
    }

    public draw(
        columnCount: number,
        rowCount: number,
        getCell: (columnIndex: number, rowIndex: number) => ICell,
        fontWidthInPixels: number,
        fontHeightInPixels: number,
        defaultBackgroundColor: string,
        viewportScaleX: number,
        viewportScaleY: number,
    ) {
        const cellCount = columnCount * rowCount
        this._recreateSolidInstancesArrayIfRequired(cellCount)
        const solidInstanceCount = this._populateSolidInstances(
            columnCount,
            rowCount,
            getCell,
            fontWidthInPixels,
            fontHeightInPixels,
            defaultBackgroundColor,
        )
        this._drawSolidInstances(solidInstanceCount, viewportScaleX, viewportScaleY)
    }

    private _createBuffers() {
        this._unitQuadVerticesBuffer = createUnitQuadVerticesBuffer(this._gl)
        this._unitQuadElementIndicesBuffer = createUnitQuadElementIndicesBuffer(this._gl)
        this._solidInstancesBuffer = this._gl.createBuffer()
    }

    private _createVertexArrayObject() {
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

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._solidInstancesBuffer)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.targetOrigin)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.targetOrigin,
            2,
            this._gl.FLOAT,
            false,
            solidInstanceSizeInBytes,
            0,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.targetOrigin, 1)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.targetSize)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.targetSize,
            2,
            this._gl.FLOAT,
            false,
            solidInstanceSizeInBytes,
            2 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.targetSize, 1)

        this._gl.enableVertexAttribArray(vertexShaderAttributes.colorRGBA)
        this._gl.vertexAttribPointer(
            vertexShaderAttributes.colorRGBA,
            4,
            this._gl.FLOAT,
            false,
            solidInstanceSizeInBytes,
            4 * Float32Array.BYTES_PER_ELEMENT,
        )
        this._gl.vertexAttribDivisor(vertexShaderAttributes.colorRGBA, 1)
    }

    private _recreateSolidInstancesArrayIfRequired(cellCount: number) {
        const requiredArrayLength = cellCount * solidInstanceFieldCount
        if (!this._solidInstances || this._solidInstances.length < requiredArrayLength) {
            this._solidInstances = new Float32Array(requiredArrayLength)
        }
    }

    private _populateSolidInstances(
        columnCount: number,
        rowCount: number,
        getCell: (columnIndex: number, rowIndex: number) => ICell,
        fontWidthInPixels: number,
        fontHeightInPixels: number,
        defaultBackgroundColor: string,
    ) {
        const pixelRatioAdaptedFontWidth = fontWidthInPixels * this._devicePixelRatio
        const pixelRatioAdaptedFontHeight = fontHeightInPixels * this._devicePixelRatio

        let solidCellCount = 0
        let y = 0

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            let x = 0

            for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
                const cell = getCell(columnIndex, rowIndex)

                if (cell.backgroundColor && cell.backgroundColor !== defaultBackgroundColor) {
                    const colorToUse = cell.backgroundColor || defaultBackgroundColor || "black"
                    const normalizedBackgroundColor = normalizeColor(colorToUse)

                    this._updateSolidInstance(
                        solidCellCount,
                        x,
                        y,
                        pixelRatioAdaptedFontWidth,
                        pixelRatioAdaptedFontHeight,
                        normalizedBackgroundColor,
                    )

                    solidCellCount++
                }
                x += pixelRatioAdaptedFontWidth
            }

            y += pixelRatioAdaptedFontHeight
        }

        return solidCellCount
    }

    private _drawSolidInstances(
        solidCount: number,
        viewportScaleX: number,
        viewportScaleY: number,
    ) {
        this._gl.bindVertexArray(this._vertexArrayObject)
        this._gl.disable(this._gl.BLEND)
        this._gl.useProgram(this._program)
        this._gl.uniform2f(this._viewportScaleLocation, viewportScaleX, viewportScaleY)
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._solidInstancesBuffer)
        this._gl.bufferData(this._gl.ARRAY_BUFFER, this._solidInstances, this._gl.STREAM_DRAW)
        this._gl.drawElementsInstanced(this._gl.TRIANGLES, 6, this._gl.UNSIGNED_BYTE, 0, solidCount)
    }

    private _updateSolidInstance(
        index: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: Float32Array,
    ) {
        const startOffset = solidInstanceFieldCount * index
        // targetOrigin
        this._solidInstances[0 + startOffset] = x
        this._solidInstances[1 + startOffset] = y
        // targetSize
        this._solidInstances[2 + startOffset] = width
        this._solidInstances[3 + startOffset] = height
        // colorRGBA
        this._solidInstances[4 + startOffset] = color[0]
        this._solidInstances[5 + startOffset] = color[1]
        this._solidInstances[6 + startOffset] = color[2]
        this._solidInstances[7 + startOffset] = color[3]
    }
}
