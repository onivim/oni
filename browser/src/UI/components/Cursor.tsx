import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

import { Motion, spring } from "react-motion"

export interface ICursorProps {
    animated: boolean
    x: number
    y: number
    scale: number
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

class CursorRenderer extends React.PureComponent<ICursorProps, {}> {

    public render(): JSX.Element {

        const fontFamily = this.props.fontFamily
        const fontSize = this.props.fontSize

        const isInsertCursor = this.props.mode === "insert" || this.props.mode === "cmdline_normal"
        const height = this.props.height ? this.props.height.toString() + "px" : "0px"
        const width = isInsertCursor ? 0 : this.props.width
        const characterToShow = isInsertCursor ? "" : this.props.character

        const containerStyle: React.CSSProperties = {
            visibility: this.props.visible ? "visible" : "hidden",
            position: "absolute",
            left: this.props.x.toString() + "px",
            top: this.props.y.toString() + "px",
            width: width.toString() + "px",
            height,
            lineHeight: height,
            color: this.props.textColor,
            fontFamily,
            fontSize,
        }

        const innerPositionStyle: React.CSSProperties = {
            position: "absolute",
            left: "0px",
            right: "0px",
            bottom: "0px",
            top: "0px",
        }

        const cursorBlockStyle: React.CSSProperties = {
            ...innerPositionStyle,
            backgroundColor: this.props.color,
        }

        const cursorCharacterStyle: React.CSSProperties = {
            ...innerPositionStyle,
            textAlign: "center",
            color: this.props.textColor,
        }

        return <Motion defaultStyle={{scale: 0}} style={{scale: spring(this.props.scale, { stiffness: 120, damping: 8})}}>
        {(val) => {
            const cursorStyle = this.props.animated ? {
                ...cursorBlockStyle,
                transform: "scale(" + val.scale + ")",
            } : cursorBlockStyle

            return <div style={containerStyle} className="cursor">
                <div style={cursorStyle} />
                <div style={cursorCharacterStyle}>{characterToShow}</div>
            </div>
        }}
        </Motion>
    }
}

const mapStateToProps = (state: State.IState): ICursorProps => {
    return {
        animated: State.readConf(state.configuration, "ui.animations.enabled"),
        x: state.cursorPixelX,
        y: state.cursorPixelY,
        scale: state.mode === "operator" ? 0.8 : state.cursorScale,
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
