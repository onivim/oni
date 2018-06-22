import * as React from "react"

import * as detectIndent from "detect-indent"
import * as memoize from "lodash/memoize"
import * as Oni from "oni-api"
import * as types from "vscode-languageserver-types"

import { IBuffer } from "../BufferManager"
import styled, { pixel, withProps } from "./../../UI/components/common"

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

interface IComments {
    start: string
    end: string | void
}

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
        const startChars = this._comments.start.split("")
        let hasEndComment = false

        if (this._comments.end) {
            const endChars = this._comments.end.split("")
            hasEndComment = endChars.some(char => trimmedLine.startsWith(char))
        }
        return startChars.some(char => trimmedLine.startsWith(char)) || hasEndComment
    })

    private _buffer: IBuffer
    private _comments: IComments
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
        return "Indent Guides Lines"
    }

    private _getIndentLines = (levelsOfIndentation: IndentLinesProps[], color?: string) => {
        return levelsOfIndentation.map(({ height, characterWidth, indentBy, left, top }, idx) => {
            const indentation = characterWidth * this._userSpacing
            return Array.from({ length: indentBy }).map((_, i) => (
                <IndentLine
                    top={top}
                    height={height}
                    key={`${indentation}-${idx}-${i}`}
                    left={left - i * indentation - characterWidth}
                    color={color}
                    data-id="indent-line"
                />
            ))
        })
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

            if ((!line && previous) || this._isComment(line)) {
                const replacement = { ...previous, top }
                acc.push(replacement)
                return acc
            }

            acc.push({
                top,
                left,
                line,
                height: Math.ceil(fontPixelHeight),
                indentBy: indentation.amount / this._userSpacing,
                characterWidth: fontPixelWidth,
            })
            return acc
        }, [])
        return this._getIndentLines(allIndentations, color)
    }
}

export default IndentGuideBufferLayer
