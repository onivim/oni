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
    color?: string
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
    border-left: 1px solid ${p => p.color || "rgba(100, 100, 100, 0.4)"};
    position: absolute;
`

interface IndentLayerArgs {
    shiftWidth: number
    buffer: Oni.Buffer
    configuration: Oni.Configuration
}

class IndentGuideBufferLayer implements Oni.BufferLayer {
    public render = memoize((bufferLayerContext: Oni.BufferLayerRenderContext) => {
        return (
            this._isValidBuffer() && (
                <Container id={this.id}>{this._renderIndentLines(bufferLayerContext)}</Container>
            )
        )
    })

    private _shiftWidth: number
    private _buffer: Oni.Buffer
    private _configuration: Oni.Configuration

    constructor({ shiftWidth, buffer, configuration }: IndentLayerArgs) {
        this._shiftWidth = shiftWidth
        this._buffer = buffer
        this._configuration = configuration
    }
    get id() {
        return "indent-guides"
    }

    private _isValidBuffer() {
        const ext = path.extname(this._buffer.filePath)
        const validFiletypes = this._configuration.getValue<string[]>(
            "experimental.indentLines.filetypes",
        )
        const isValid = validFiletypes.includes(ext)
        return isValid
    }

    private _getIndentLines = (levelsOfIndentation: IndentLinesProps[], color?: string) => {
        return levelsOfIndentation.map(({ height, characterWidth, indentBy, left, top }, idx) => {
            const indentation = characterWidth * this._shiftWidth
            return Array.from({ length: indentBy }).map((_, i) => (
                <IndentLine
                    top={top}
                    height={height}
                    key={`${indentation}-${idx}-${i}`}
                    left={left - i * indentation - characterWidth}
                    color={color}
                />
            ))
        })
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
        const color = this._configuration.getValue<string>("experimental.indentLines.color")
        const { visibleLines, fontPixelHeight, fontPixelWidth } = bufferLayerContext
        const allIndentations = visibleLines.reduce((acc, line, idx) => {
            const indentation = detectIndent(line)
            const startPosition = bufferLayerContext.bufferToScreen(
                types.Position.create(bufferLayerContext.topBufferLine, indentation.amount),
            )

            if (!startPosition) {
                return acc
            }

            const { pixelX: left, pixelY: top } = bufferLayerContext.screenToPixel({
                screenX: startPosition.screenX,
                screenY: idx,
            })

            const previous = acc[idx - 1]

            if (!line && previous) {
                const replacement = { ...previous, top }
                acc.push(replacement)
                return acc
            }

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
        return this._getIndentLines(allIndentations, color)
    }
}

export default IndentGuideBufferLayer
