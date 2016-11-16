import * as React from "react"
import { connect } from "react-redux"

import { State } from "./../State"

require("./QuickInfo.less")

export interface QuickInfoProps {
    x: number
    y: number
    title: string
    documentation: string
}

export class QuickInfo extends React.Component<QuickInfoProps, void> {

    public render(): JSX.Element {

        const containerStyle = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            left: this.props.x.toString() + "px",
        }

        const innerStyle = {
            position: "absolute",
            bottom: "0px"
        }

        return (<div style={containerStyle}>
                <div style={innerStyle} className="quickinfo">
                    <div className="title">{this.props.title}</div>
                    <div className="documentation">{this.props.documentation}</div>
                </div>
            </div>)
    }
}

const mapStateToQuickInfoProps = (state: State) => {
    const ret: QuickInfoProps = {
        x: state.cursorPixelX,
        y: state.cursorPixelY - (state.fontPixelHeight),
        title: state.quickInfo.title,
        documentation: state.quickInfo.description
    }
    return ret
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
