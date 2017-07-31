import * as React from "react"

import { connect } from "react-redux"

import * as Config from "./../../Config"
import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Icon } from "./../Icon"

import { getColorFromSeverity } from "./../../Services/Errors"
import { WindowContext2 } from "./../Overlay/WindowContext"

import * as types from "vscode-languageserver-types"

require("./Error.less") // tslint:disable-line no-var-requires

export interface IErrorsProps {
    errors: types.Diagnostic[]
    fontWidthInPixels: number
    fontHeightInPixels: number
    window: State.IWindow
    showDetails: boolean
}

const padding = 8

export class Errors extends React.PureComponent<IErrorsProps, void> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        if (!this.props.window || !this.props.window.dimensions) {
            return null
        }

        const windowContext = new WindowContext2(this.props.fontWidthInPixels, this.props.fontHeightInPixels, this.props.window)

        const markers = errors.map((e) => {
            const lineNumber = e.range.start.line + 1
            const column = e.range.start.character + 1
            if (windowContext.isLineInView(lineNumber)) {
                const screenLine = windowContext.getWindowLine(lineNumber)

                const xPos = windowContext.getWindowPosition(lineNumber, column).x
                const yPos = windowContext.getWindowRegionForLine(lineNumber).y - (padding / 2)
                const isActive = screenLine === windowContext.getCurrentWindowLine()

                const showTooltipTop = windowContext.dimensions.height - windowContext.getWindowLine(lineNumber) <= 2

                return <ErrorMarker isActive={isActive}
                    x={xPos}
                    y={yPos}
                    showTooltipTop={showTooltipTop}
                    text={e.message}
                    color={getColorFromSeverity(e.severity)}
                    showDetails={this.props.showDetails} />
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
    showTooltipTop: boolean
    text: string
    isActive: boolean
    color: string
    showDetails: boolean
}

export class ErrorMarker extends React.Component<IErrorMarkerProps, void> {

    private config = Config.instance()

    public render(): JSX.Element {

        const iconPositionStyles = {
            top: this.props.y.toString() + "px",
        }
        const textPositionStyles = {
            left: this.props.x.toString() + "px",
            // Tooltip below line: use top so text grows downward when text gets longer
            // Tooltip above line: use bottom so text grows upward
            top: this.props.showTooltipTop ? "initial" : this.props.y.toString() + "px",
            bottom: this.props.showTooltipTop ? "calc(100% - " + this.props.y.toString() + "px" : "initial",
            borderColor: this.props.color,
        }

        const className = [
            "error",
            this.props.isActive ? "active" : "",
            this.props.showTooltipTop ? "top" : "",
        ].join(" ")

        // TODO change editor.errors.slideOnFocus name
        const errorDescription = this.config.getValue("editor.errors.slideOnFocus") ? (
            <div className={className} style={textPositionStyles}>
                <div className="text">
                    {this.props.text}
                </div>
            </div>) : null
        const errorIcon = <div style={iconPositionStyles} className="error-marker">
            <div className="icon-container" style={{ color: this.props.color }}>
                <Icon name="exclamation-circle" />
            </div>
        </div>

        return <div>
            {this.props.showDetails ? errorDescription : null}
            {errorIcon}
        </div>
    }
}

export interface IErrorSquiggleProps {
    x: number,
    y: number,
    height: number,
    width: number,
    color: string,
}

export class ErrorSquiggle extends React.Component<IErrorSquiggleProps, void> {
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

import { createSelector } from "reselect"

export const getErrorsForFile = createSelector(
    [Selectors.getActiveWindow, Selectors.getErrors],
    (window, errors) => {
        const errorsForFile = (window && window.file) ? Selectors.getAllErrorsForFile(window.file, errors) : []
        return errorsForFile
    })

const mapStateToProps = (state: State.IState): IErrorsProps => {
    const window = Selectors.getActiveWindow(state)

    const errors = getErrorsForFile(state)

    const showDetails = state.mode !== "insert"

    return {
        errors,
        fontWidthInPixels: state.fontPixelWidth,
        fontHeightInPixels: state.fontPixelHeight,
        window,
        showDetails,
    }
}

export const ErrorsContainer = connect(mapStateToProps)(Errors)
