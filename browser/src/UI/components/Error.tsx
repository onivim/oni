/**
 * Error.tsx
 *
 * Various UI components related to showing errors on screen
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import styled from "styled-components"
import { bufferScrollBarSize, withProps } from "./common"

import { getColorFromSeverity } from "./../../Services/Errors"

import { Icon } from "./../Icon"

import { BufferToScreen, ScreenToPixel } from "./../Coordinates"

export interface IErrorsProps {
    errors: types.Diagnostic[]
    fontWidthInPixels: number
    fontHeightInPixels: number

    cursorLine: number
    bufferToScreen: BufferToScreen
    screenToPixel: ScreenToPixel
}

const padding = 8

export class Errors extends React.PureComponent<IErrorsProps, {}> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        if (!this.props.bufferToScreen) {
            return null
        }

        const markers = errors.map((e) => {

            const screenSpaceStart = this.props.bufferToScreen(types.Position.create(e.range.start.line, e.range.start.character))
            if (!screenSpaceStart) {
                return null
            }

            const screenLine = screenSpaceStart.screenY

            const screenY = screenLine
            const pixelPosition = this.props.screenToPixel({screenX: 0, screenY })
            const isActive = this.props.cursorLine === e.range.start.line
            const pixelY = pixelPosition.pixelY - (padding / 2)

            return <ErrorMarker isActive={isActive}
                y={pixelY}
                text={e.message}
                color={getColorFromSeverity(e.severity)} />
        })

        const squiggles = errors
            .filter((e) => e && e.range && e.range.start && e.range.end)
            .map((e) => {
            const lineNumber = e.range.start.line
            const column = e.range.start.character
            const endColumn = e.range.end.character

            const startPosition = this.props.bufferToScreen(types.Position.create(lineNumber, column))

            if (!startPosition) {
                return null
            }

            const endPosition = this.props.bufferToScreen(types.Position.create(lineNumber, endColumn))

            if (!endPosition) {
                return null
            }

            const pixelStart = this.props.screenToPixel(startPosition)
            const pixelEnd = this.props.screenToPixel(endPosition)
            const pixelWidth = pixelEnd.pixelX - pixelStart.pixelX
            const normalizedPixelWidth = pixelWidth === 0 ? this.props.fontWidthInPixels : pixelWidth

            return <ErrorSquiggle
                y={pixelStart.pixelY}
                height={this.props.fontHeightInPixels}
                x={pixelStart.pixelX}
                width={normalizedPixelWidth}
                color={getColorFromSeverity(e.severity)} />
        })

        return <div>{markers}{squiggles}</div>
    }
}

export interface IErrorMarkerProps {
    y: number
    text: string
    isActive: boolean
    color: string
}

export const ErrorMarker = (props: IErrorMarkerProps) => {

    const Wrapper = styled.div`
        position: absolute;
        top: ${props.y}px;
        right: ${bufferScrollBarSize};
        opacity: 0.5;
        display: flex;
        justify-content: flex-end;
        background-color: rgb(80, 80, 80);
        ${props.isActive ? `opacity: 0.8;` : ``}
        `

    return <Wrapper>
        <ErrorIcon color={props.color} />
    </Wrapper>
}

export interface IErrorIconProps {
    color: string
}

export const ErrorIcon = (props: IErrorIconProps) => {

    const StyledIcon = styled(Icon)`
        color: ${props.color};
        padding: 6px;
        `

    return <StyledIcon name="exclamation-circle" />
}

export interface IErrorSquiggleProps {
    x: number,
    y: number,
    height: number,
    width: number,
    color: string,
}

export const ErrorSquiggle = withProps<IErrorSquiggleProps>(styled.div)`
    position: absolute;
    top: ${props => props.y}px;
    left: ${props => props.x}px;
    height: ${props => props.height}px;
    width: ${props => props.width}px;
    border-bottom: 1px curled ${props => props.color};
    `

