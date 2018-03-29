/**
 * Error.tsx
 *
 * Various UI components related to showing errors on screen
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { getColorFromSeverity } from "./../../Services/Diagnostics"

import { Icon } from "./../Icon"
import styled, { bufferScrollBarSize, withProps } from "./common"

export interface IErrorsProps {
    errors: types.Diagnostic[]
    fontWidthInPixels: number
    fontHeightInPixels: number

    bufferToScreen: Oni.Coordinates.BufferToScreen
    screenToPixel: Oni.Coordinates.ScreenToPixel
}

const padding = 8

export class Errors extends React.PureComponent<IErrorsProps, {}> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        if (!this.props.bufferToScreen) {
            return null
        }

        const markers = errors.map(e => {
            const screenSpaceStart = this.props.bufferToScreen(
                types.Position.create(e.range.start.line, e.range.start.character),
            )
            if (!screenSpaceStart) {
                return null
            }

            const screenLine = screenSpaceStart.screenY

            const screenY = screenLine
            const pixelPosition = this.props.screenToPixel({ screenX: 0, screenY })
            const pixelY = pixelPosition.pixelY - padding / 2

            return (
                <ErrorMarker y={pixelY} text={e.message} color={getColorFromSeverity(e.severity)} />
            )
        })

        const squiggles = errors
            .filter(e => e && e.range && e.range.start && e.range.end)
            .map(e => {
                const lineNumber = e.range.start.line
                const column = e.range.start.character
                const endColumn = e.range.end.character

                const startPosition = this.props.bufferToScreen(
                    types.Position.create(lineNumber, column),
                )

                if (!startPosition) {
                    return null
                }

                const endPosition = this.props.bufferToScreen(
                    types.Position.create(lineNumber, endColumn),
                )

                if (!endPosition) {
                    return null
                }

                const pixelStart = this.props.screenToPixel(startPosition)
                const pixelEnd = this.props.screenToPixel(endPosition)
                const pixelWidth = pixelEnd.pixelX - pixelStart.pixelX
                const normalizedPixelWidth =
                    pixelWidth === 0 ? this.props.fontWidthInPixels : pixelWidth

                return (
                    <ErrorSquiggle
                        y={pixelStart.pixelY}
                        height={this.props.fontHeightInPixels}
                        x={pixelStart.pixelX}
                        width={normalizedPixelWidth}
                        color={getColorFromSeverity(e.severity)}
                    />
                )
            })

        return (
            <div>
                {markers}
                {squiggles}
            </div>
        )
    }
}

interface IIconContainerProps {
    color: string
}
const IconContainer = withProps<IIconContainerProps>(styled.div)`
    color: ${props => props.color};
`

interface IErrorMarkerWrapperProps {
    topOffset: number
}
const ErrorMarkerWrapper = withProps<IErrorMarkerWrapperProps>(styled.div)`
    position: absolute;
    top: ${props => props.topOffset}px;
    right: ${bufferScrollBarSize};
    opacity: 0.5;
    width: 200px;
    display: flex;

    & ${IconContainer} {
        position: absolute;
        right: 0px;
        background-color: rgb(80, 80, 80);

        & .fa {
            padding: 6px;
        }
    }
`

export interface IErrorMarkerProps {
    y: number
    text: string
    color: string
}

export class ErrorMarker extends React.PureComponent<IErrorMarkerProps, {}> {
    public render(): JSX.Element {
        return (
            <div>
                <ErrorMarkerWrapper
                    topOffset={this.props.y}
                    key={this.props.y.toString() + this.props.text + this.props.color}
                >
                    <ErrorIcon color={this.props.color} />
                </ErrorMarkerWrapper>
            </div>
        )
    }
}

export interface IErrorIconProps {
    color: string
}

export const ErrorIcon = (props: IErrorIconProps) => {
    return (
        <IconContainer color={props.color}>
            <Icon name="exclamation-circle" />
        </IconContainer>
    )
}

export interface IErrorSquiggleProps {
    x: number
    y: number
    height: number
    width: number
    color: string
}
export const ErrorSquiggle = withProps<IErrorSquiggleProps>(styled.div)`
    position: absolute;
    ${props => `
        top: ${props.y}px;
        left: ${props.x}px;
        height: ${props.height}px;
        width: ${props.width}px;
        border-bottom: 1px dashed ${props.color};
    `}
`
