/**
 * TypingPredictions
 *
 * Component to render characters entered by the user, prior to round-tripping through Neovim
 * The purpose of this is to provide a very low-latency typing experience
 */

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

import { IPredictedCharacter, TypingPredictionManager } from "./../../Services/TypingPredictionManager"

export interface ITypingPredictionProps {
    typingPrediction: TypingPredictionManager
}

export interface ITypingPredictionViewProps {
    startX: number
    y: number
    width: number
    height: number
    color: string
    textColor: string
    fontFamily: string
    fontSize: string
    visible: boolean
    typingPrediction: TypingPredictionManager
}

export interface ITypingPredictionViewState {
    predictions: IPredictedCharacter[]
}

class TypingPredictionView extends React.PureComponent<ITypingPredictionViewProps, ITypingPredictionViewState> {

    constructor(props: ITypingPredictionViewProps) {
        super(props)

        this.state = {
            predictions: []
        }
    }

    public componentDidMount(): void {

        this.props.typingPrediction.onPredictionsChanged.subscribe((updatedPredictions: IPredictedCharacter[]) => {

            this.setState({
                predictions: updatedPredictions,
            })
        })
    }

    public render(): JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const predictions = this.state.predictions.map((tp, idx) => {

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
                // color: this.props.color,
            }

            return <div className="predicted-text" style={style}>{tp.character}</div>
        })

        return <div className="typing-predictions">{predictions}</div>
    }
}

const mapStateToProps = (state: State.IState, props: ITypingPredictionProps): ITypingPredictionViewProps => {
    return {
        ...props,
        startX: state.cursorPixelX,
        y: state.cursorPixelY,
        width: state.cursorPixelWidth,
        height: state.fontPixelHeight,
        color: state.foregroundColor,
        textColor: state.backgroundColor,
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: State.readConf(state.configuration, "editor.fontSize"),
        visible: state.mode === "insert" && !state.imeActive,
    }
}

export const TypingPrediction = connect(mapStateToProps)(TypingPredictionView)
