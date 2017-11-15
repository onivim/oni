/**
 * TypingPredictions
 *
 * Component to render characters entered by the user, prior to round-tripping through Neovim
 * The purpose of this is to provide a very low-latency typing experience
 */

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

export interface ITypingPredictionProps {
    startX: number
    y: number
    width: number
    height: number
    color: string
    textColor: string
    fontFamily: string
    fontSize: string
    visible: boolean
    typingPredictions: State.IPredictedCharacter[]
}

class TypingPredictionView extends React.PureComponent<ITypingPredictionProps, {}> {

    public render(): JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const predictions = this.props.typingPredictions.map((tp, idx) => {

            const style: React.CSSProperties = {
                position: "absolute",
                top: this.props.y.toString() + "px",
                left: (this.props.startX + idx * this.props.width).toString() + "px",
                width: this.props.width.toString() + "px",
                height: this.props.height.toString() + "px",
                lineHeight: this.props.height.toString() + "px",
                fontFamily: this.props.fontFamily,
                fontSize: this.props.fontSize,
                textAlign: "center",
                backgroundColor: "red",
                color: "white"
            }

            return <div className="predicted-text" style={style}>{tp.character}</div>
        })

        return <div className="typing-predictions">{predictions}</div>
    }
}

const mapStateToProps = (state: State.IState): ITypingPredictionProps => {
    return {
        startX: state.cursorPixelX,
        y: state.cursorPixelY,
        width: state.cursorPixelWidth,
        height: state.fontPixelHeight,
        color: state.foregroundColor,
        textColor: state.backgroundColor,
        typingPredictions: state.typingPredictions,
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: State.readConf(state.configuration, "editor.fontSize"),
        visible: state.mode === "insert" && !state.imeActive,
    }
}

export const TypingPrediction = connect(mapStateToProps)(TypingPredictionView)
