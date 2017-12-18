/**
 * Error.tsx
 *
 * Various UI components related to showing errors on screen
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"
import styled from "styled-components"

import { getColorFromSeverity } from "./../../Services/Errors"

import { Icon } from "./../Icon"

import { BufferToScreen, ScreenToPixel } from "./../Coordinates"

import { bufferScrollBarSize } from "./common"

require("./Error.less") // tslint:disable-line no-var-requires

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
            const isActive = this.props.cursorLine - 1 === e.range.start.line
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

const StyledErrorMarker = styled.div`
    position: absolute;
    right: ${bufferScrollBarSize};
    opacity: 0.5;
    `

export class ErrorMarker extends React.PureComponent<IErrorMarkerProps, {}> {

    public render(): JSX.Element {

        const iconPositionStyles = {
            opacity: this.props.isActive ? 0.8 : 0.5,
            top: this.props.y.toString() + "px",
        }

        const errorIcon = <StyledErrorMarker style={iconPositionStyles}>
            <ErrorIcon color={this.props.color} />
        </StyledErrorMarker>

        return <div>
            {errorIcon}
        </div>
    }
}

export interface IErrorIconProps {
    color: string
}

const StyledOuterIcon = styled.div`
    position: absolute;
    right: 0px;
    background-color: rgb(80, 80, 80);
`

const StyledInnerIcon = styled.div`
    padding: 6px;
`

export const ErrorIcon = (props: IErrorIconProps) => {
    return <StyledOuterIcon style={{ color: props.color }}>
        <StyledInnerIcon>
            <Icon name="exclamation-circle" />
        </StyledInnerIcon>
    </StyledOuterIcon>
}

export interface IErrorSquiggleProps {
    x: number,
    y: number,
    height: number,
    width: number,
    color: string,
}

const StyledErrorSquiggle = styled.div`
    position: absolute
`

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

        return <StyledErrorSquiggle style={style}></StyledErrorSquiggle>
    }
}
