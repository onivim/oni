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
import { bufferScrollBarSize, pixel, styled, withProps } from "./common"

export interface IErrorsProps {
    errors: types.Diagnostic[]
    fontWidthInPixels: number
    fontHeightInPixels: number

    bufferToScreen: Oni.Coordinates.BufferToScreen
    screenToPixel: Oni.Coordinates.ScreenToPixel
}

const padding = 8

export const Errors = (props: IErrorsProps) => {
    const errors = props.errors || []

    if (!props.bufferToScreen) {
        return null
    }

    const markers = errors.map(e => {
        const screenSpaceStart = props.bufferToScreen(
            types.Position.create(e.range.start.line, e.range.start.character),
        )
        if (!screenSpaceStart) {
            return null
        }

        const screenLine = screenSpaceStart.screenY

        const screenY = screenLine
        const pixelPosition = props.screenToPixel({ screenX: 0, screenY })
        const pixelY = pixelPosition.pixelY - padding / 2

        return <ErrorMarker y={pixelY} text={e.message} color={getColorFromSeverity(e.severity)} />
    })

    const squiggles = errors.filter(e => e && e.range && e.range.start && e.range.end).map(e => {
        const lineNumber = e.range.start.line
        const column = e.range.start.character
        const endColumn = e.range.end.character

        const startPosition = props.bufferToScreen(types.Position.create(lineNumber, column))

        if (!startPosition) {
            return null
        }

        const endPosition = props.bufferToScreen(types.Position.create(lineNumber, endColumn))

        if (!endPosition) {
            return null
        }

        const pixelStart = props.screenToPixel(startPosition)
        const pixelEnd = props.screenToPixel(endPosition)
        const pixelWidth = pixelEnd.pixelX - pixelStart.pixelX
        const normalizedPixelWidth = pixelWidth === 0 ? props.fontWidthInPixels : pixelWidth

        return (
            <ErrorSquiggle
                y={pixelStart.pixelY}
                height={props.fontHeightInPixels}
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

interface IErrorMarkerProps {
    y: number
    text: string
    color: string
}

const ErrorMarker = (props: IErrorMarkerProps) => (
    <ErrorMarkerWrapper topOffset={props.y} key={props.y.toString() + props.text + props.color}>
        <ErrorIcon color={props.color} />
    </ErrorMarkerWrapper>
)

interface ErrorMarkerProps {
    topOffset: number
}

const ErrorMarkerWrapper = withProps<ErrorMarkerProps>(styled.div).attrs({
    style: (props: ErrorMarkerProps) => ({
        top: pixel(props.topOffset),
    }),
})`
    position: absolute;
    right: ${bufferScrollBarSize};
    opacity: 0.5;
    background-color: rgb(80, 80, 80);
    padding: 4.5px 7px;
`

interface IErrorIconProps {
    color: string
}

export const ErrorIcon = (props: IErrorIconProps) => (
    <IconContainer color={props.color}>
        <Icon name="exclamation-circle" />
    </IconContainer>
)

const IconContainer = withProps<{ color: string }>(styled.div)`
    color: ${props => props.color};
`

interface IErrorSquiggleProps {
    x: number
    y: number
    height: number
    width: number
    color: string
}

const ErrorSquiggle = withProps<IErrorSquiggleProps>(styled.div).attrs({
    style: (props: IErrorSquiggleProps) => ({
        top: pixel(props.y),
        left: pixel(props.x),
        height: pixel(props.height),
        width: pixel(props.width),
        borderBottom: `1px dashed ${props.color}`,
    }),
})`
    position: absolute;
`
