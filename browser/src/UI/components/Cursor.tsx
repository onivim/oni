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
    textColor: string
    character: string
    fontFamily: string
    fontSize: string
    visible: boolean
}

require("./Cursor.less") // tslint:disable-line no-var-requires

class CursorRenderer extends React.PureComponent<ICursorProps, void> {

    public render(): JSX.Element {

        const fontFamily = this.props.fontFamily
        const fontSize = this.props.fontSize

        const isInsertCursor = this.props.mode === "insert" || this.props.mode === "cmdline_normal"
        const height = this.props.height.toString() + "px"
        const width = isInsertCursor ? this.props.width / 4 : this.props.width
        const characterToShow = isInsertCursor ? "" : this.props.character

        const cursorStyle: React.CSSProperties = {
            visibility: this.props.visible ? "visible" : "hidden",
            position: "absolute",
            left: this.props.x.toString() + "px",
            top: this.props.y.toString() + "px",
            width: width.toString() + "px",
            height,
            lineHeight: height,
            backgroundColor: this.props.color,
            color: this.props.textColor,
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
        textColor: state.backgroundColor,
        character: state.cursorCharacter,
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: State.readConf(state.configuration, "editor.fontSize"),
        visible: !state.imeActive,
    }
}

export const Cursor = connect(mapStateToProps)(CursorRenderer)
