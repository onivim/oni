import * as React from "react"

import * as detectIndent from "detect-indent"
import * as flatten from "lodash/flatten"
import * as last from "lodash/last"
import moize from "moize"
import * as Oni from "oni-api"

import { IBuffer } from "../BufferManager"
import styled, { pixel, withProps } from "./../../UI/components/common"

type IContext = Oni.BufferLayerRenderContext

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

interface ConfigOptions {
    skipFirst: boolean
    color?: string
}

interface LinePropsWithLevels extends IndentLinesProps {
    levelOfIndentation: number
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

const determineIfShouldSkip = (props: LinePropsWithLevels, options: ConfigOptions) => {
    const skipFirstIndentLine = options.skipFirst && props.levelOfIndentation === props.indentBy - 1
    return skipFirstIndentLine
}

/**
 * Remove one indent from left positioning and move lines slightly inwards -
 * by a third of a character for a better visual appearance
 */
const calculateLeftPosition = (props: LinePropsWithLevels) => {
    const adjustedLeft =
        props.left -
        props.indentSize -
        props.levelOfIndentation * props.indentSize +
        props.characterWidth / 3

    return adjustedLeft
}

interface IIndentsPerLine {
    guidePositions: IndentLinesProps[]
    options: ConfigOptions
}

const IndentsPerLine: React.SFC<IIndentsPerLine> = ({ guidePositions, options }) => {
    const indents = guidePositions.map((props, idx) =>
        // Create a line per indentation
        Array.from({ length: props.indentBy }, (_, levelOfIndentation) => {
            const lineProps = { ...props, levelOfIndentation }
            const adjustedLeft = calculateLeftPosition(lineProps)
            const shouldSkip = determineIfShouldSkip(lineProps, options)
            const key = `${props.line.trim()}-${idx}-${levelOfIndentation}`
            return (
                !shouldSkip && (
                    <IndentLine
                        key={key}
                        top={props.top}
                        left={adjustedLeft}
                        color={options.color}
                        height={props.height}
                        data-id="indent-line"
                    />
                )
            )
        }),
    )
    return <>{flatten(indents)}</>
}

const MemoizedIndentsPerLine = moize.reactSimple(IndentsPerLine, {
    isDeepEqual: true,
})

interface IGuideLines {
    context: IContext
    userSpacing: number
    configuration: ConfigOptions
}

/**
 * Calculates the position of each indent guide element using shiftwidth or tabstop if no
 * shift width available
 */
const IndentGuideLines: React.SFC<IGuideLines> = ({ context, ...props }) => {
    const wrappedLines = getWrappedLines(context)
    const { visibleLines, fontPixelHeight, fontPixelWidth, topBufferLine } = context
    const indentSize = props.userSpacing * fontPixelWidth

    // TODO: If the beginning of the visible lines is wrapping no lines are drawn
    const { allIndentations } = visibleLines.reduce(
        (acc, line, currentLineNumber) => {
            const rawIndentation = detectIndent(line)
            const regularisedIndent = regulariseIndentation(rawIndentation, props.userSpacing)
            const previous = last(acc.allIndentations)
            const height = Math.ceil(fontPixelHeight)

            // start position helps determine the initial indent offset
            const startPosition = context.bufferToScreen({
                line: topBufferLine,
                character: regularisedIndent,
            })

            const wrappedLine = wrappedLines.find(wrapped => wrapped.line === line)
            const levelsOfWrapping = wrappedLine ? wrappedLine.end - wrappedLine.start : 1
            const adjustedHeight = height * levelsOfWrapping

            if (!startPosition) {
                return acc
            }

            const { pixelX: left, pixelY: top } = context.screenToPixel({
                screenX: startPosition.screenX,
                screenY: currentLineNumber,
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
                indentBy: regularisedIndent / props.userSpacing,
            }

            acc.allIndentations.push(indent)

            return acc
        },
        { allIndentations: [], wrappedHeightAdjustment: 0 },
    )

    return <MemoizedIndentsPerLine guidePositions={allIndentations} options={props.configuration} />
}

const getWrappedLines = (ctx: Partial<IContext>): IWrappedLine[] => {
    const { lines } = ctx.visibleLines.reduce(
        (acc, line, index) => {
            const currentLine = ctx.topBufferLine + index
            const bufferInfo = ctx.bufferToScreen({ line: currentLine, character: 0 })

            if (bufferInfo && bufferInfo.screenY) {
                const { screenY: screenLine } = bufferInfo
                if (acc.expectedLine !== screenLine) {
                    acc.lines.push({
                        start: acc.expectedLine,
                        end: screenLine,
                        line,
                    })
                    acc.expectedLine = screenLine + 1
                    return acc
                }
                acc.expectedLine += 1
            }
            return acc
        },
        { lines: [], expectedLine: 1 },
    )
    return lines
}

const regulariseIndentation = (indentation: detectIndent.IndentInfo, userSpacing: number) => {
    const isOddBy = indentation.amount % userSpacing
    const amountToIndent = isOddBy ? indentation.amount - isOddBy : indentation.amount
    return amountToIndent
}

interface IndentLayerArgs {
    buffer: IBuffer
    configuration: Oni.Configuration
}

class IndentGuideBufferLayer implements Oni.BufferLayer {
    private _buffer: IBuffer
    private _userSpacing: number
    private _configuration: ConfigOptions

    get id() {
        return "indent-guides"
    }

    get friendlyName() {
        return "Indent Guide Lines"
    }

    constructor({ buffer, configuration }: IndentLayerArgs) {
        this._buffer = buffer
        this._configuration = {
            color: configuration.getValue<string>("experimental.indentLines.color"),
            skipFirst: configuration.getValue<boolean>("experimental.indentLines.skipFirst"),
        }
        this._userSpacing = this._buffer.shiftwidth || this._buffer.tabstop
    }

    public render = (bufferLayerContext: IContext) => {
        return (
            <Container id={this.id}>
                <IndentGuideLines
                    context={bufferLayerContext}
                    userSpacing={this._userSpacing}
                    configuration={this._configuration}
                />
            </Container>
        )
    }
}

export default IndentGuideBufferLayer
