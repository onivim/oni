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

    private _containerElement: HTMLElement
    private _lastWidth: number

    private _predictedElements: { [id: number]: HTMLElement } = {}

    constructor(props: ITypingPredictionViewProps) {
        super(props)

        this.state = {
            predictions: []
        }
    }

    public componentDidMount(): void {

            this.props.typingPrediction.onPredictionsChanged.subscribe((updatedPredictions: IPredictedCharacter[]) => {

                if (!this._containerElement) {
                    return
                }

                this._containerElement.innerHTML = ""

                // Add new predictions
                updatedPredictions.forEach((up, idx) => {
                    // if (!this._predictedElements[up.id]) {
                        const elem = document.createElement("div")
                        elem.className = "predicted-text"
                        elem.style.position = "absolute"
                        elem.style.top = this.props.y.toString() + "px"
                        elem.style.left = (this.props.startX + idx * this.props.width).toString() + "px"
                        elem.style.width = (this.props.width.toString()) + "px"
                        elem.style.height = (this.props.height.toString()) + "px"
                        elem.style.lineHeight = this.props.height.toString() + "px"

                        // elem.style.color = "white"
                        elem.style.backgroundColor = "rgba(255, 0, 0, 0.5)"
                        elem.textContent = up.character

                        this._containerElement.appendChild(elem)

                        // Force paint:

                        this._predictedElements[up.id] = this._containerElement

                    // }
                })

                // Force re-layout
                this._lastWidth = this._containerElement.offsetWidth

                // Remove old predictions

                // this.setState({
                //     predictions: updatedPredictions,
                // })
            })
    }

    public render(): JSX.Element {

        // if (!this.props.visible) {
        //     return null
        // }

        const containerStyle: React.CSSProperties = {
            willChange: "transform",
            color: this.props.color,
            fontFamily: this.props.fontFamily,
            fontSize: this.props.fontSize,
        }

        // const predictions = this.state.predictions.map((tp, idx) => {


        //     const style: React.CSSProperties = {
        //         position: "absolute",
        //         top: this.props.y.toString() + "px",
        //         left: (this.props.startX + idx * this.props.width).toString() + "px",
        //         width: this.props.width.toString() + "px",
        //         height: this.props.height.toString() + "px",
        //         lineHeight: this.props.height.toString() + "px",
        //         fontFamily: this.props.fontFamily,
        //         fontSize: this.props.fontSize,
        //         textAlign: "center",
        //         // backgroundColor: "red",
        //         // color: "white",
        //         willChange: "transform",
        //         color: this.props.color,
        //     }

        // return <div className="predicted-text" key={"predicted-text"} style={containerStyle} ref={(elem) => this._containerElement = elem}>{tp.character}</div>
        // })

        return <div className="typing-predictions" key={"typing-predictions"} style={containerStyle} ref={(elem) => this._containerElement = elem}></div>
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
        visible: true,
    }
}

export const TypingPrediction = connect(mapStateToProps)(TypingPredictionView)
