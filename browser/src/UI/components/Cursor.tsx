import * as React from "react"
import { connect } from "react-redux"

import * as Config from "./../../Config"
import * as State from "./../State"

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

    private config = Config.instance()

    public render(): JSX.Element {

        const fontFamily = this.config.getValue<string>("editor.fontFamily")
        const fontSize = this.config.getValue<string>("editor.fontSize")

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
            opacity: 0.5,
            fontFamily,
            fontSize,
        }

        return <div style={cursorStyle} className="cursor">{characterToShow}</div>
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
