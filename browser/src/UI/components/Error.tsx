import * as React from "react"
import * as ReactDOM from "react-dom"

import { Icon } from "./../Icon"
import * as Config from "./../../Config"

import { IWindowContext } from "./../OverlayManager"

require("./Error.less")

export interface ErrorsProps {
    errors: Oni.Plugin.Diagnostics.Error[]
    windowContext: IWindowContext
}

const padding = 8

export class Errors extends React.Component<ErrorsProps, void> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        const markers = errors.map(e => {
            if (this.props.windowContext.isLineInView(e.lineNumber)) {
                const screenLine = this.props.windowContext.getWindowLine(e.lineNumber)

                const yPos = this.props.windowContext.getWindowRegionForLine(e.lineNumber).y - (padding / 2)
                const isActive = screenLine === this.props.windowContext.getCurrentWindowLine()

                return <ErrorMarker isActive={isActive}
                    y={yPos}
                    height={this.props.windowContext.fontHeightInPixels}
                    text={e.text} />
            } else {
                return null
            }
        })

        const squiggles = errors.map(e => {
            if (this.props.windowContext.isLineInView(e.lineNumber) && e.endColumn) {
                // const screenLine = this.props.windowContext.getWindowLine(e.lineNumber)

                const yPos = this.props.windowContext.getWindowRegionForLine(e.lineNumber).y

                const startX = this.props.windowContext.getWindowPosition(e.lineNumber, e.startColumn as any).x // FIXME: undefined
                const endX = this.props.windowContext.getWindowPosition(e.lineNumber, e.endColumn).x

                return <ErrorSquiggle
                    y={yPos}
                    height={this.props.windowContext.fontHeightInPixels}
                    x={startX}
                    width={endX - startX} />
            } else {
                return null
            }
        })

        return <div>{markers}{squiggles}</div>
    }
}


export interface ErrorMarkerProps {
    y: number
    height: number
    text: string
    isActive: boolean
}

export class ErrorMarker extends React.Component<ErrorMarkerProps, void> {

    public render(): JSX.Element {

        const positionDivStyles = {
            top: this.props.y.toString() + "px",
            height: (padding + this.props.height).toString() + "px"
        }

        let className = this.props.isActive ? "error-marker active" : "error-marker"

        const errorDescription = Config.getValue<boolean>("editor.errors.slideOnFocus") ? (<div className="error">
            <div className="text">
                {this.props.text}
            </div>
        </div>) : null

        return <div style={positionDivStyles} className={className}>
            {errorDescription}
            <div className="icon-container">
                <Icon name="exclamation-circle" />
            </div>
        </div>
    }
}

export interface ErrorSquiggleProps {
    x: number,
    y: number,
    height: number,
    width: number
}

export class ErrorSquiggle extends React.Component<ErrorSquiggleProps, void> {
    public render(): JSX.Element {

        const {x, y, width, height} = this.props

        const style = {
            top: y.toString() + "px",
            left: x.toString() + "px",
            height: height.toString() + "px",
            width: width.toString() + "px"
        }

        return <div className="error-squiggle" style={style}></div>
    }
}

export function renderErrorMarkers(props: ErrorsProps, element: HTMLElement) {
    ReactDOM.render(<Errors {...props} />, element)
}

