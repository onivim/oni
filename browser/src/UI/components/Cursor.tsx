import * as React from "react"
import { connect } from "react-redux"
import * as State from "./../State"
import * as Config from "./../../Config"

export interface ICursorProps {
    x: number
    y: number
    width: number
    height: number
    mode: string
    color: string
    character: string
}

require("./Cursor.less") // tslint:disable-line no-var-requires

class CursorRenderer extends React.Component<ICursorProps, void> {

    public render(): JSX.Element {

        const fontFamily = Config.getValue<string>("editor.fontFamily")
        const fontSize = Config.getValue<string>("editor.fontSize")

        const width = this.props.mode === "normal" ? this.props.width : this.props.width / 4

        const cursorStyle = {
            position: "absolute",
            left: this.props.x.toString() + "px",
            top: this.props.y.toString() + "px",
            width: width.toString() + "px",
            height: this.props.height.toString() + "px",
            backgroundColor: this.props.color,
            opacity: 0.5,
            fontFamily,
            fontSize,
        }

        return <div style={cursorStyle} className="cursor">{this.props.character}</div>
    }
}

const mapStateToProps = (state: State.IState) => {
    return {
        x: state.cursorPixelX,
        y: state.cursorPixelY,
        width: state.cursorPixelWidth,
        height: state.fontPixelHeight,
        mode: state.mode,
        color: state.foregroundColor,
        character: state.cursorCharacter,
    }
}

export const Cursor = connect(mapStateToProps)(CursorRenderer)
