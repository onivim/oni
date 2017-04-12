import * as _ from "lodash"
import * as React from "react"
import * as ReactDOM from "react-dom"

import * as Config from "./../../Config"
import { Icon } from "./../Icon"

import { WindowContext } from "./../Overlay/WindowContext"

require("./Error.less") // tslint:disable-line no-var-requires

export interface IErrorWithColor extends Oni.Plugin.Diagnostics.Error {
    color: string
}

export interface IErrorsProps {
    errors: IErrorWithColor[]
    windowContext: WindowContext
}

const padding = 8

export class Errors extends React.Component<IErrorsProps, void> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        // TODO optimization: Only group errors together that are close enough in terms of startColumn
        const groupedErrors = _.groupBy(errors, (e) => e.lineNumber)

        const markers = _.map(groupedErrors, (es) => {
            let screenLine: number
            let xPos: number
            let yPos: number
            let text: string[]
            let color: string
            if (es.length === 1) {
                screenLine = this.props.windowContext.getWindowLine(es[0].lineNumber)
                xPos = this.props.windowContext.getWindowPosition(es[0].lineNumber, es[0].startColumn).x
                yPos = this.props.windowContext.getWindowRegionForLine(es[0].lineNumber).y - (padding / 2)
                text = [es[0].text]
                color = es[0].color
            } else {
                screenLine = this.props.windowContext.getWindowLine(es[0].lineNumber)
                let minColumn = _.min(_.map(es, (e) => e.startColumn))
                xPos = this.props.windowContext.getWindowPosition(es[0].lineNumber, minColumn).x
                yPos = this.props.windowContext.getWindowRegionForLine(es[0].lineNumber).y - (padding / 2)
                text = _.map(es, (e) => "* " + e.text)
                color = es[0].color
            }
            if (this.props.windowContext.isLineInView(es[0].lineNumber)) {
                const isActive = screenLine === this.props.windowContext.getCurrentWindowLine()

                const showTooltipTop = this.props.windowContext.dimensions.height - this.props.windowContext.getWindowLine(es[0].lineNumber) <= 2

                return <ErrorMarker isActive={isActive}
                    x={xPos}
                    y={yPos}
                    showTooltipTop={showTooltipTop}
                    text={text}
                    color={color}/>
            } else {
                return null
            }
        })

        const squiggles = errors.map((e) => {
            if (this.props.windowContext.isLineInView(e.lineNumber) && e.endColumn) {
                // const screenLine = this.props.windowContext.getWindowLine(e.lineNumber)

                const yPos = this.props.windowContext.getWindowRegionForLine(e.lineNumber).y

                const startX = this.props.windowContext.getWindowPosition(e.lineNumber, e.startColumn as any).x // FIXME: undefined
                const endX = this.props.windowContext.getWindowPosition(e.lineNumber, e.endColumn).x

                return <ErrorSquiggle
                    y={yPos}
                    height={this.props.windowContext.fontHeightInPixels}
                    x={startX}
                    width={endX - startX}
                    color={e.color}/>
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
    text: string[]
    isActive: boolean
    color: string
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

        const texts = _.map(this.props.text, (t) => {
            return <div className="text"> {t} </div>
        })

        // TODO change editor.errors.slideOnFocus name
        const errorDescription = this.config.getValue("editor.errors.slideOnFocus") ? (
            <div className={className} style={textPositionStyles}>
                {texts}
            </div>) : null
        const errorIcon = <div style={iconPositionStyles} className="error-marker">
            <div className="icon-container" style={{color: this.props.color}}>
                <Icon name="exclamation-circle" />
            </div>
        </div>

        return <div>
         {errorDescription}
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

        const {x, y, width, height, color} = this.props

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

export function renderErrorMarkers(props: IErrorsProps, element: HTMLElement) {
    ReactDOM.render(<Errors {...props} />, element)
}
