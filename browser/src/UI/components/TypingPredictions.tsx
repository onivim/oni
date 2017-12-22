/**
 * TypingPredictions
 *
 * Component to render characters entered by the user, prior to round-tripping through Neovim
 * The purpose of this is to provide a very low-latency typing experience
 */

import { IDisposable } from "oni-types"

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { ITypingPrediction, TypingPredictionManager } from "./../../Services/TypingPredictionManager"

import { addDefaultUnitIfNeeded } from "./../../Font"

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
    highlightPredictions: boolean
}

const noop = (val?: any): void => { } // tslint:disable-line

class TypingPredictionView extends React.PureComponent<ITypingPredictionViewProps, {}> {

    private _containerElement: HTMLElement
    private _subscription: IDisposable

    private _predictedElements: { [id: number]: HTMLElement } = {}

    public componentDidMount(): void {
        this._subscription = this.props.typingPrediction.onPredictionsChanged.subscribe((prediction: ITypingPrediction) => {

            if (!this._containerElement) {
                return
            }

            this._containerElement.innerHTML = ""

            const updatedPredictions = prediction.predictedCharacters
            const startX = (prediction.predictedCursorColumn - prediction.predictedCharacters.length) * this.props.width

            this._containerElement.style.top = this.props.y.toString() + "px"
            this._containerElement.style.height = this.props.height.toString() + "px"
            this._containerElement.style.left = startX.toString() + "px"
            this._containerElement.style.width = (prediction.predictedCharacters.length * this.props.width).toString() + "px"

            if (this.props.highlightPredictions) {
                this._containerElement.style.color = "white"
                this._containerElement.style.backgroundColor = "rgba(255, 0, 0, 0.5)"
            } else {
                this._containerElement.style.color = prediction.foregroundColor
                this._containerElement.style.backgroundColor = prediction.backgroundColor
            }

            // Add new predictions
            updatedPredictions.forEach((up, idx) => {
                const elem = document.createElement("div")
                elem.className = "predicted-text"
                elem.style.position = "absolute"
                elem.style.top = "0px"
                elem.style.left = (idx * this.props.width).toString() + "px"
                elem.style.width = (this.props.width.toString()) + "px"
                elem.style.height = (this.props.height.toString()) + "px"
                elem.style.lineHeight = this.props.height.toString() + "px"

                if (this.props.highlightPredictions) {
                    elem.style.color = "white"
                    elem.style.backgroundColor = "rgba(255, 0, 0, 0.5)"
                }

                elem.textContent = up.character

                this._containerElement.appendChild(elem)

                this._predictedElements[up.id] = this._containerElement

            })

            // Force re-layout
            noop(this._containerElement.offsetWidth)
        })
    }

    public componentWillUnmount(): void {
        if (this._subscription) {
            this._subscription.dispose()
            this._subscription = null
        }
    }

    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            contain: "strict",
            willChange: "transform",
            backgroundColor: this.props.color,
            color: this.props.textColor,
            fontFamily: this.props.fontFamily,
            fontSize: this.props.fontSize,
            position: "absolute",
        }

        return <div className="typing-predictions" key={"typing-predictions"} style={containerStyle} ref={(elem) => this._containerElement = elem}></div>
    }
}

const mapStateToProps = (state: State.IState, props: ITypingPredictionProps): ITypingPredictionViewProps => {
    return {
        ...props,
        highlightPredictions: state.configuration["debug.showTypingPrediction"],
        startX: state.cursorPixelX,
        y: state.cursorPixelY,
        width: state.cursorPixelWidth,
        height: state.fontPixelHeight,
        color: state.colors["editor.background"],
        textColor: state.colors["editor.foreground"],
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: addDefaultUnitIfNeeded(State.readConf(state.configuration, "editor.fontSize")),
        visible: true,
    }
}

export const TypingPrediction = connect(mapStateToProps)(TypingPredictionView)
