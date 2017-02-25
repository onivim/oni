import * as React from "react"
import { connect } from "react-redux"
import * as State from "./../State"

export interface ICursorLineRendererProps {
    x: number
    y: number
    width: number
    height: number
    color: string
    visible: boolean
    opacity: number
}

export interface ICursorLineProps {
    lineType: string
}

// require("./Cursor.less") // tslint:disable-line no-var-requires

class CursorLineRenderer extends React.Component<ICursorLineRendererProps, void> {

    public render(): null |  JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const width = this.props.width

        const cursorStyle = {
            position: "absolute",
            left: this.props.x.toString() + "px", // Window Start
            top: this.props.y.toString() + "px", // Same as cursor
            width: width.toString() + "px", // Window width

            height: this.props.height.toString() + "px", // Same as cursor
            backgroundColor: this.props.color,
            opacity: this.props.opacity,
        }

        return <div style={cursorStyle} className="cursorLine"></div>
    }
}

const mapStateToProps = (state: State.IState, props: ICursorLineProps) => {
    return {
        x: props.lineType === "line" ? state.activeWindowDimensions.x : state.cursorPixelX,
        y: props.lineType === "line" ? state.cursorPixelY : state.activeWindowDimensions.y,
        width: props.lineType === "line" ? state.activeWindowDimensions.width : state.cursorPixelWidth,
        height: props.lineType === "line" ? state.fontPixelHeight : state.activeWindowDimensions.height,
        color: state.foregroundColor,
        visible: props.lineType === "line" ? state.cursorLineVisible : state.cursorColumnVisible,
        opacity: props.lineType === "line" ? state.cursorLineOpacity : state.cursorColumnOpacity,
    }
}

export const CursorLine = connect(mapStateToProps)(CursorLineRenderer)
