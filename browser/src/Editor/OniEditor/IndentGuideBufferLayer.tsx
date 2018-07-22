import * as React from "react"

import * as detectIndent from "detect-indent"
import * as flatten from "lodash/flatten"
import * as last from "lodash/last"
import * as memoize from "lodash/memoize"
import * as Oni from "oni-api"

import { IBuffer } from "../BufferManager"
import styled, { pixel, withProps } from "./../../UI/components/common"

interface IWrappedLine {
    start: number
    end: number
    line: string
}

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
    indentSize: number
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

    private _buffer: IBuffer
    private _userSpacing: number
    private _configuration: Oni.Configuration

    constructor({ buffer, configuration }: IndentLayerArgs) {
        this._buffer = buffer
        this._configuration = configuration
        this._userSpacing = this._buffer.shiftwidth || this._buffer.tabstop
    }
    get id() {
        return "indent-guides"
    }

    get friendlyName() {
        return "Indent Guide Lines"
    }

    private _getIndentLines = (
        guidePositions: IndentLinesProps[],
        skipFirst: boolean,
        color?: string,
    ) => {
        return flatten(
            guidePositions.map((props, idx) => {
                return Array.from({ length: props.indentBy }, (_, levelOfIndentation) => {
                    // remove one indent from left positioning, create a line per indentation, move lines
                    // slightly inwards - by a third of a character width for a better visual appearance
                    const adjustedLeft =
                        props.left -
                        props.indentSize -
                        levelOfIndentation * props.indentSize +
                        props.characterWidth / 3

                    const skip = skipFirst && levelOfIndentation === props.indentBy - 1
                    const key = `${props.line.trim()}-${idx}-${levelOfIndentation}`
                    return (
                        !skip && (
                            <IndentLine
                                key={key}
                                color={color}
                                top={props.top}
                                height={props.height}
                                left={adjustedLeft}
                                data-id="indent-line"
                            />
                        )
                    )
                })
            }),
        )
    }

    private _getWrappedLines(context: Oni.BufferLayerRenderContext): IWrappedLine[] {
        const { lines } = context.visibleLines.reduce(
            (acc, line, index) => {
                const currentLine = context.topBufferLine + index
                const bufferInfo = context.bufferToScreen({ line: currentLine, character: 0 })

                if (bufferInfo && bufferInfo.screenY) {
                    const { screenY: screenLine } = bufferInfo
                    if (acc.expectedLine !== screenLine) {
                        acc.lines.push({
                            start: acc.expectedLine,
                            end: screenLine,
                            line,
                        })
                        acc.expectedLine = screenLine + 1
                    } else {
                        acc.expectedLine += 1
                    }
                }
                return acc
            },
            { lines: [], expectedLine: 1 },
        )
        return lines
    }

    private _regulariseIndentation(indentation: detectIndent.IndentInfo) {
        const isOddBy = indentation.amount % this._userSpacing
        const amountToIndent = isOddBy ? indentation.amount - isOddBy : indentation.amount
        return amountToIndent
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
        // TODO:
        // 1. If the beginning of the visible lines is wrapping no lines are drawn
        // 2. If a line wraps but the wrapped line has no content line positions are off by one
        const wrappedScreenLines = this._getWrappedLines(bufferLayerContext)
        const color = this._configuration.getValue<string>("experimental.indentLines.color")
        const skipFirst = this._configuration.getValue<boolean>(
            "experimental.indentLines.skipFirst",
        )
        const { visibleLines, fontPixelHeight, fontPixelWidth, topBufferLine } = bufferLayerContext
        const indentSize = this._userSpacing * fontPixelWidth

        const { allIndentations } = visibleLines.reduce(
            (acc, line, currenLineNumber) => {
                const rawIndentation = detectIndent(line)

                const regularisedIndent = this._regulariseIndentation(rawIndentation)

                const previous = last(acc.allIndentations)
                const height = Math.ceil(fontPixelHeight)

                // start position helps determine the initial indent offset
                const startPosition = bufferLayerContext.bufferToScreen({
                    line: topBufferLine,
                    character: regularisedIndent,
                })

                const wrappedLine = wrappedScreenLines.find(wrapped => wrapped.line === line)
                const levelsOfWrapping = wrappedLine ? wrappedLine.end - wrappedLine.start : 1
                const adjustedHeight = height * levelsOfWrapping

                if (!startPosition) {
                    return acc
                }

                const { pixelX: left, pixelY: top } = bufferLayerContext.screenToPixel({
                    screenX: startPosition.screenX,
                    screenY: currenLineNumber,
                })

                const adjustedTop = top + acc.wrappedHeightAdjustment

                // Only adjust height for Subsequent lines!
                if (wrappedLine) {
                    acc.wrappedHeightAdjustment += adjustedHeight
                }

                if (!line && previous) {
                    acc.allIndentations.push({
                        ...previous,
                        line,
                        top: adjustedTop,
                    })
                    return acc
                }

                const indent = {
                    left,
                    line,
                    indentSize,
                    top: adjustedTop,
                    height: adjustedHeight,
                    characterWidth: fontPixelWidth,
                    indentBy: regularisedIndent / this._userSpacing,
                }

                acc.allIndentations.push(indent)

                return acc
            },
            { allIndentations: [], wrappedHeightAdjustment: 0 },
        )

        return this._getIndentLines(allIndentations, skipFirst, color)
    }
}

export default IndentGuideBufferLayer
