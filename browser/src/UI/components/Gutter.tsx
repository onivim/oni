/**
 * Gutter.tsx
 *
 * UI to the left of the scrollbar, showing icons
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { getColorFromSeverity } from "./../../Services/Errors"

import { Icon } from "./../Icon"

import { EmptyArray } from "./../../Utility"

export interface IErrorsProps {
    errors: types.Diagnostic[]
    fontWidthInPixels: number
    fontHeightInPixels: number

    cursorLine: number
    bufferToScreen: Oni.Coordinates.BufferToScreen
    screenToPixel: Oni.Coordinates.ScreenToPixel
}

const padding = 8

export class Gutter extends React.PureComponent<IErrorsProps, {}> {
    public render(): JSX.Element {

        const errors = this.props.errors || EmptyArray

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
            const isActive = this.props.cursorLine - 1 === e.range.start.line
            const pixelY = pixelPosition.pixelY - (padding / 2)

            return <ErrorMarker isActive={isActive}
                y={pixelY}
                text={e.message}
                color={getColorFromSeverity(e.severity)} />
        })

        return <div>{markers}</div>
    }
}

export interface IErrorMarkerProps {
    y: number
    text: string
    isActive: boolean
    color: string
}

export class ErrorMarker extends React.PureComponent<IErrorMarkerProps, {}> {

    public render(): JSX.Element {

        const iconPositionStyles = {
            top: this.props.y.toString() + "px",
        }

        const errorIcon = <div style={iconPositionStyles} className="error-marker">
            <ErrorIcon color={this.props.color} />
        </div>

        return <div>
            {errorIcon}
        </div>
    }
}

export interface IErrorIconProps {
    color: string
}

export const ErrorIcon = (props: IErrorIconProps) => {
    return <div className="icon-container" style={{ color: props.color }}>
        <Icon name="exclamation-circle" />
    </div>
}
