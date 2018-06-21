import * as React from "react"

import * as detectIndent from "detect-indent"
import * as memoize from "lodash/memoize"
import * as Oni from "oni-api"
import * as path from "path"
import * as types from "vscode-languageserver-types"

import styled, { pixel, withProps } from "./../../../UI/components/common"

interface IProps {
    height: number
    left: number
    top: number
    line: string
    indentBy?: number
}

interface IndentLinesProps {
    top: number
    left: number
    height: number
    line: string
    indentBy: number
    characterWidth: number
}

const Container = styled.div``

const IndentLine = withProps<IProps>(styled.span).attrs({
    style: ({ height, left, top }: IProps) => ({
        height: pixel(height),
        left: pixel(left),
        top: pixel(top),
    }),
})`
    border-left: 1px solid white;
    position: absolute;
    opacity: 0.6;
`

interface IndentLayerArgs {
    shiftWidth: number
    buffer: Oni.Buffer
}

class IndentGuideBufferLayer implements Oni.BufferLayer {
    public render = memoize((bufferLayerContext: Oni.BufferLayerRenderContext) => {
        // console.log("bufferLayerContext: ", JSON.stringify(bufferLayerContext, null, 2))
        return (
            this._isValidBuffer() && (
                <Container id={this.id}>{this._renderIndentLines(bufferLayerContext)}</Container>
            )
        )
    })

    private _shiftWidth: number
    private _buffer: Oni.Buffer

    constructor({ shiftWidth, buffer }: IndentLayerArgs) {
        this._shiftWidth = shiftWidth
        this._buffer = buffer
    }
    get id() {
        return "indent-guides"
    }

    private _isValidBuffer() {
        const ext = path.extname(this._buffer.filePath)
        const validFiletypes = [".tsx", ".ts", ".jsx", ".js"]
        const isValid = validFiletypes.includes(ext)
        return isValid
    }

    private _getIndentLines = (previousLines: IndentLinesProps[]) => {
        const indentGuidesForLine = previousLines.map((line, idx) => {
            const indentation = line.characterWidth * this._shiftWidth
            return Array.from({ length: line.indentBy }).map((_, i) => (
                <IndentLine
                    top={line.top}
                    line={line.line}
                    height={line.height}
                    key={`${indentation}-${idx}-${i}`}
                    left={line.left - i * indentation - line.characterWidth}
                />
            ))
        })
        return indentGuidesForLine
    }

    /**
     * Calculates the position of each indent guide element using shiftwidth
     *
     * @name _renderIndentLines
     * @function
     * @param {Oni.BufferLayerRenderContext} bufferLayerContext The buffer layer context
     * @returns {JSX.Element[]} An array of react elements
     */
    private _renderIndentLines = (bufferLayerContext: Oni.BufferLayerRenderContext) => {
        const { visibleLines, fontPixelHeight, fontPixelWidth, topBufferLine } = bufferLayerContext
        const allIndentations = visibleLines.reduce((acc, line, idx) => {
            const indentation = detectIndent(line)
            const { pixelY: top } = bufferLayerContext.screenToPixel({
                screenX: 0,
                screenY: idx,
            })
            const previous = acc[idx - 1]
            if (!line && previous) {
                const replacement = { ...previous, top }
                acc.push(replacement)
                return acc
            }
            const startPosition = bufferLayerContext.bufferToScreen(
                // the first argument here should be the top line in the buffer
                types.Position.create(topBufferLine, indentation.amount),
            )
            if (!startPosition) {
                return acc
            }
            const { pixelX: left /*, pixelY */ } = bufferLayerContext.screenToPixel(startPosition)
            acc.push({
                top,
                left,
                line,
                height: Math.ceil(fontPixelHeight),
                indentBy: indentation.amount / this._shiftWidth,
                characterWidth: fontPixelWidth,
            })
            return acc
        }, [])
        return this._getIndentLines(allIndentations)
    }
}

export default IndentGuideBufferLayer
