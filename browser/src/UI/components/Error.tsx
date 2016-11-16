import * as React from "react"
import * as ReactDOM from "react-dom"

import { Icon } from "./../Icon"

require("./Error.less")

export interface ErrorsProps {
    errors: Oni.Plugin.Diagnostics.Error[]
    lineToPositionMap: any
    fontHeight: number
    fontWidth: number
}

const padding = 8

export class Errors extends React.Component<ErrorsProps, void> {
    public render(): JSX.Element {
        const errors = this.props.errors || []

        const markers = errors.map(e => {
            if(this.props.lineToPositionMap[e.lineNumber]) {
                const screenLine = this.props.lineToPositionMap[e.lineNumber]
                const yPos = (screenLine - 1) * this.props.fontHeight - (padding / 2)
                return <ErrorMarker y={yPos} height={this.props.fontHeight} text={e.text} />
            } else {
                return null
            }
        })

        const squiggles = errors.map(e => {
            if(this.props.lineToPositionMap[e.lineNumber] && e.endColumn) {
                const screenLine = this.props.lineToPositionMap[e.lineNumber]
                const yPos = (screenLine - 1) * this.props.fontHeight - (padding / 2)

                const startX = e.startColumn * this.props.fontWidth
                const endX = e.endColumn * this.props.fontWidth

                return <ErrorSquiggle 
                            y={yPos} 
                            height={this.props.fontHeight} 
                            x={startX}
                            width={endX-startX}/>
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
}

export class ErrorMarker extends React.Component<ErrorMarkerProps, void> {

    public render(): JSX.Element {

        const positionDivStyles = {
            top: this.props.y.toString() + "px",
            right: "0px",
            height: (padding + this.props.height).toString() + "px"
        }

        return <div style={positionDivStyles} className="error-marker">
                     <div className="error">
                        <div className="text">
                            {this.props.text}
                        </div>
                        <div className="icon-container">
                            <Icon name="exclamation-circle" />
                        </div>
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

        const {x,y,width,height} = this.props

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

