/**
 * Error.tsx
 *
 * Various UI components related to showing errors on screen
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { getColorFromSeverity } from "./../../Services/Errors"

import { Icon } from "./../Icon"

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

export interface IErrorMarkerProps {
    y: number
    text: string
    color: string
}

export class ErrorMarker extends React.PureComponent<IErrorMarkerProps, {}> {
    public render(): JSX.Element {
        const iconPositionStyles = {
            top: this.props.y.toString() + "px",
        }

        const errorIcon = (
            <div style={iconPositionStyles} className="error-marker">
                <ErrorIcon color={this.props.color} />
            </div>
        )

        return <div>{errorIcon}</div>
    }
}

export interface IErrorIconProps {
    color: string
}

export const ErrorIcon = (props: IErrorIconProps) => {
    return (
        <div className="icon-container" style={{ color: props.color }}>
            <Icon name="exclamation-circle" />
        </div>
    )
}

export interface IErrorSquiggleProps {
    x: number
    y: number
    height: number
    width: number
    color: string
}

export class ErrorSquiggle extends React.PureComponent<IErrorSquiggleProps, {}> {
    public render(): JSX.Element {
        const { x, y, width, height, color } = this.props

        const style = {
            top: y.toString() + "px",
            left: x.toString() + "px",
            height: height.toString() + "px",
            width: width.toString() + "px",
            borderBottom: `1px dashed ${color}`,
        }

        return <div className="error-squiggle" style={style} />
    }
}
