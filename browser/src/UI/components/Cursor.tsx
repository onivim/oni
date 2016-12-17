import * as React from "react"
import { connect } from "react-redux"
import * as State from "./../State"

export interface CursorProps {
    x: number
    y: number
    width: number
    height: number
    mode: string
    color: string
}

require("./Cursor.less")

class _Cursor extends React.Component<CursorProps, void> {

    public render(): JSX.Element {

        const width = this.props.mode === "normal" ? this.props.width : this.props.width / 4

        const cursorStyle = {
            position: "absolute",
            left: this.props.x.toString() + "px",
            top: this.props.y.toString() + "px",
            width: width.toString() + "px",
            height: this.props.height.toString() + "px",
            backgroundColor: this.props.color,
            opacity: 0.5
        }

        return <div style={cursorStyle} className="cursor"/>
    }
}

const mapStateToProps =(state: State.IState) => {
    return {
        x: state.cursorPixelX,
        y: state.cursorPixelY,
        width: state.fontPixelWidth,
        height: state.fontPixelHeight,
        mode: state.mode,
        color: state.foregroundColor,
    }
}

export const Cursor = connect(mapStateToProps)(_Cursor)
