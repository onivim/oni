import * as React from "react"

import * as detectIndent from "detect-indent"
import * as flatten from "lodash/flatten"
import * as last from "lodash/last"
import * as memoize from "lodash/memoize"
import * as Oni from "oni-api"

import { IBuffer } from "../BufferManager"
import styled, { pixel, withProps } from "./../../UI/components/common"

interface IProps {
    height: number
    left: number
    top: number
    color?: string
}

interface IWrappedLine {
    start: number
    end?: number
    line: string
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
    buffer: IBuffer
    configuration: Oni.Configuration
}

class IndentGuideBufferLayer implements Oni.BufferLayer {
    public render = memoize((bufferLayerContext: Oni.BufferLayerRenderContext) => {
        return <Container id={this.id}>{this._renderIndentLines(bufferLayerContext)}</Container>
    })

    private _isComment = memoize((line: string) => {
        const trimmedLine = line.trim()
        return this._comments.some(comment => trimmedLine.startsWith(comment))
    })

    private _buffer: IBuffer
    private _comments: string[]
    private _userSpacing: number
    private _configuration: Oni.Configuration

    constructor({ buffer, configuration }: IndentLayerArgs) {
        this._buffer = buffer
        this._configuration = configuration
        this._comments = this._buffer.comment
        this._userSpacing = this._buffer.shiftwidth || this._buffer.tabstop
    }
    get id() {
        return "indent-guides"
    }

    get friendlyName() {
        return "Indent Guide Lines"
    }

    private _getIndentLines = (guidePositions: IndentLinesProps[], color?: string) => {
        return flatten(
            guidePositions.map(({ line, height, characterWidth, indentBy, left, top }, lineNo) => {
                const indentation = characterWidth * this._userSpacing
                return Array.from({ length: indentBy }, (_, level) => {
                    const adjustedLeft = left - level * indentation - characterWidth
                    return (
                        <IndentLine
                            top={top}
                            color={color}
                            height={height}
                            left={adjustedLeft}
                            key={`${line.trim()}-${lineNo}-${indentation}-${level}`}
                            data-id="indent-line"
                        />
                    )
                })
            }),
        )
    }

    private _getWrappedLines(context: Oni.BufferLayerRenderContext) {
        const lines: IWrappedLine[] = []
        for (
            let currentLine = context.topBufferLine, expectedLine = 1, index = 0;
            currentLine < context.bottomBufferLine;
            currentLine++, index++
        ) {
            const bufferInfo = context.bufferToScreen({ line: currentLine, character: 0 })
            if (bufferInfo && bufferInfo.screenY) {
                const { screenY: screenLine } = bufferInfo
                if (expectedLine !== screenLine) {
                    lines.push({
                        start: expectedLine,
                        end: screenLine,
                        line: context.visibleLines[index],
                    })
                    expectedLine = screenLine + 1
                } else {
                    expectedLine += 1
                }
            }
        }
        return lines
    }

    /**
     * Calculates the position of each indent guide element using shiftwidth or tabstop if no
     * shift width available
     * @name _renderIndentLines
     * @function
     * @param {Oni.BufferLayerRenderContext} bufferLayerContext The buffer layer context
     * @returns {JSX.Element[]} An array of react elements
     */
    private _renderIndentLines = (bufferLayerContext: Oni.BufferLayerRenderContext) => {
        const wrappedScreenLines = this._getWrappedLines(bufferLayerContext)
        const color = this._configuration.getValue<string>("experimental.indentLines.color")
        const { visibleLines, fontPixelHeight, fontPixelWidth, topBufferLine } = bufferLayerContext

        const { allIndentations } = visibleLines.reduce(
            (acc, line, currenLineNumber) => {
                const indentation = detectIndent(line)

                const previous = last(acc.allIndentations)
                const height = Math.ceil(fontPixelHeight)

                // start position helps determine the initial indent offset
                const startPosition = bufferLayerContext.bufferToScreen({
                    line: topBufferLine,
                    character: indentation.amount,
                })

                const wrappedLine = wrappedScreenLines.find(wrapped => wrapped.line === line)
                const levelsOfWrapping = wrappedLine ? wrappedLine.end - wrappedLine.start : 1
                const adjustedHeight = height * levelsOfWrapping

                // Check if a line has content but is not indented if so do not
                // create indentation metadata for it
                const emptyUnindentedLine = !indentation.amount && line && !previous

                if (!startPosition || emptyUnindentedLine) {
                    return acc
                }

                const { pixelX: left, pixelY: top } = bufferLayerContext.screenToPixel({
                    screenX: startPosition.screenX,
                    screenY: currenLineNumber,
                })

                if ((!line && previous) || this._isComment(line)) {
                    const replacement = { ...previous, top }
                    acc.allIndentations.push(replacement)
                    return acc
                }

                const indent = {
                    left,
                    line,
                    top: top + acc.wrappedHeightAdjustment,
                    height: adjustedHeight,
                    indentBy: indentation.amount / this._userSpacing,
                    characterWidth: fontPixelWidth,
                }

                acc.allIndentations.push(indent)

                // Only adjust height for Subsequent lines!
                if (wrappedLine) {
                    acc.wrappedHeightAdjustment += adjustedHeight
                }

                return acc
            },
            { allIndentations: [], wrappedHeightAdjustment: 0 },
        )

        return this._getIndentLines(allIndentations, color)
    }
}

export default IndentGuideBufferLayer
