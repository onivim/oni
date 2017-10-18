import * as React from "react"

import { connect } from "react-redux"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Icon } from "./../Icon"

import { getColorFromSeverity } from "./../../Services/Errors"
import { WindowContext } from "./../WindowContext"

import * as types from "vscode-languageserver-types"

require("./Error.less") // tslint:disable-line no-var-requires

export interface IErrorsProps {
    errors: types.Diagnostic[]
    fontWidthInPixels: number
    fontHeightInPixels: number
    window: State.IWindow
}

const padding = 8

export class Errors extends React.PureComponent<IErrorsProps, void> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        if (!this.props.window || !this.props.window.dimensions) {
            return null
        }

        const windowContext = new WindowContext(this.props.fontWidthInPixels, this.props.fontHeightInPixels, this.props.window)

        const markers = errors.map((e) => {
            const lineNumber = e.range.start.line + 1
            const column = e.range.start.character + 1
            if (windowContext.isLineInView(lineNumber)) {
                const screenLine = windowContext.getWindowLine(lineNumber)

                const xPos = windowContext.getWindowPosition(lineNumber, column).x
                const yPos = windowContext.getWindowRegionForLine(lineNumber).y - (padding / 2)
                const isActive = screenLine === windowContext.getCurrentWindowLine()

                return <ErrorMarker isActive={isActive}
                    x={xPos}
                    y={yPos}
                    text={e.message}
                    color={getColorFromSeverity(e.severity)} />
            } else {
                return null
            }
        })

        const squiggles = errors
            .filter((e) => e && e.range && e.range.start && e.range.end)
            .map((e) => {
            const lineNumber = e.range.start.line + 1
            const column = e.range.start.character + 1
            const endColumn = e.range.end.character + 1

            if (windowContext.isLineInView(lineNumber)) {
                const yPos = windowContext.getWindowRegionForLine(lineNumber).y

                const startX = windowContext.getWindowPosition(lineNumber, column).x // FIXME: undefined
                const endX = windowContext.getWindowPosition(lineNumber, endColumn).x

                return <ErrorSquiggle
                    y={yPos}
                    height={windowContext.fontHeightInPixels}
                    x={startX}
                    width={endX - startX}
                    color={getColorFromSeverity(e.severity)} />
            } else {
                return null
            }
        })

        return <div>{markers}{squiggles}</div>
    }
}

export interface IErrorMarkerProps {
    x: number
    y: number
    text: string
    isActive: boolean
    color: string
}

export class ErrorMarker extends React.PureComponent<IErrorMarkerProps, void> {

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

export interface IErrorSquiggleProps {
    x: number,
    y: number,
    height: number,
    width: number,
    color: string,
}

export class ErrorSquiggle extends React.PureComponent<IErrorSquiggleProps, void> {
    public render(): JSX.Element {

        const { x, y, width, height, color } = this.props

        const style = {
            top: y.toString() + "px",
            left: x.toString() + "px",
            height: height.toString() + "px",
            width: width.toString() + "px",
            borderBottom: `1px dashed ${color}`,
        }

        return <div className="error-squiggle" style={style}></div>
    }
}

const mapStateToProps = (state: State.IState): IErrorsProps => {
    const window = Selectors.getActiveWindow(state)

    const errors = Selectors.getErrorsForActiveFile(state)

    return {
        errors,
        fontWidthInPixels: state.fontPixelWidth,
        fontHeightInPixels: state.fontPixelHeight,
        window,
    }
}

export const ErrorsContainer = connect(mapStateToProps)(Errors)
