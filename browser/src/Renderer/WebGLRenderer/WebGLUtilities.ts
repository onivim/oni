export const createProgram = (
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
) => {
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)
    return linkProgram(gl, vertexShader, fragmentShader)
}

const compileShader = (gl: WebGL2RenderingContext, source: string, type: number) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader)
        throw new Error("Could not compile WebGL program: \n\n" + info)
    }

    return shader
}

const linkProgram = (
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
) => {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program)
        throw new Error("Could not compile WebGL program: \n\n" + info)
    }
    return program
}

const unitQuadVertices = new Float32Array([1, 1, 1, 0, 0, 0, 0, 1])

export const createUnitQuadVerticesBuffer = (gl: WebGL2RenderingContext) => {
    const unitQuadVerticesBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, unitQuadVerticesBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, unitQuadVertices, gl.STATIC_DRAW)
    return unitQuadVerticesBuffer
}

const unitQuadElementIndices = new Uint8Array([0, 1, 3, 1, 2, 3])

export const createUnitQuadElementIndicesBuffer = (gl: WebGL2RenderingContext) => {
    const unitQuadElementIndicesBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, unitQuadElementIndicesBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, unitQuadElementIndices, gl.STATIC_DRAW)
    return unitQuadElementIndicesBuffer
}
