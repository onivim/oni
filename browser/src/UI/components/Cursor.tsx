import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

export interface ICursorProps {
    x: number
    y: number
    width: number
    height: number
    mode: string
    color: string
    character: string
    fontFamily: string
    fontSize: string
}

require("./Cursor.less") // tslint:disable-line no-var-requires

class CursorRenderer extends React.Component<ICursorProps, void> {

    public render(): JSX.Element {

        const fontFamily = this.props.fontFamily
        const fontSize = this.props.fontSize

        const isNormalMode = this.props.mode === "normal"
        const width = isNormalMode ? this.props.width : this.props.width / 4
        const characterToShow = isNormalMode ? this.props.character : ""

        const cursorStyle = {
            position: "absolute",
            left: this.props.x.toString() + "px",
            top: this.props.y.toString() + "px",
            width: width.toString() + "px",
            height: this.props.height.toString() + "px",
            backgroundColor: this.props.color,
            fontFamily,
            fontSize,
        }

        return <div style={cursorStyle} className="cursor">{characterToShow}</div>
    }
}

const mapStateToProps = (state: State.IState): ICursorProps => {
    return {
        x: state.cursorPixelX,
        y: state.cursorPixelY,
        width: state.cursorPixelWidth,
        height: state.fontPixelHeight,
        mode: state.mode,
        color: state.foregroundColor,
        character: state.cursorCharacter,
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: State.readConf(state.configuration, "editor.fontSize"),
    }
}

export const Cursor = connect(mapStateToProps)(CursorRenderer)
