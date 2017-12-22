import * as React from "react"
import { connect } from "react-redux"

import styled from "styled-components"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { Motion, spring } from "react-motion"

import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"

import { addDefaultUnitIfNeeded } from "./../../Font"

export interface ICursorRendererProps {
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
    fontPixelWidth: number
    visible: boolean

    typingPrediction: TypingPredictionManager
}

const StyledCursor = styled.div`
`

export interface ICursorRendererState {
    predictedCursorColumn: number
}

class CursorRenderer extends React.PureComponent<ICursorRendererProps, ICursorRendererState> {

    constructor(props: ICursorRendererProps) {
        super(props)

        this.state = {
            predictedCursorColumn: -1,
        }
    }

    public componentDidMount(): void {
        this.props.typingPrediction.onPredictionsChanged.subscribe((predictions) => {
            this.setState({
                predictedCursorColumn: predictions.predictedCursorColumn,
            })
        })
    }

    public render(): JSX.Element {

        const fontFamily = this.props.fontFamily
        const fontSize = this.props.fontSize

        const isInsertCursor = this.props.mode === "insert" || this.props.mode === "cmdline_normal"
        const height = this.props.height ? this.props.height.toString() + "px" : "0px"
        const width = isInsertCursor ? 0 : this.props.width
        const characterToShow = isInsertCursor ? "" : this.props.character

        const position = this.props.mode === "insert" && this.state.predictedCursorColumn >= 0 ?
                            this.state.predictedCursorColumn * this.props.fontPixelWidth :
                            this.props.x

        const containerStyle: React.CSSProperties = {
            visibility: this.props.visible ? "visible" : "hidden",
            position: "absolute",
            left: (position - 1).toString() + "px",
            top: this.props.y.toString() + "px",
            width: (width + 2).toString() + "px",
            height,
            lineHeight: height,
            color: this.props.textColor,
            fontFamily,
            fontSize,
            transform: "translateZ(0px)",
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

        if (!this.props.animated) {
            return this._renderCursor(containerStyle, cursorBlockStyle, cursorCharacterStyle, characterToShow)
        } else {
            return <Motion defaultStyle={{scale: 0}} style={{scale: spring(this.props.scale, { stiffness: 120, damping: 8})}}>
            {(val) => {
                const cursorStyle = {
                    ...cursorBlockStyle,
                    transform: "scale(" + val.scale + ")",
                }
                return this._renderCursor(containerStyle, cursorStyle, cursorCharacterStyle, characterToShow)
            }}
            </Motion>
        }
    }

    private _renderCursor(containerStyle: React.CSSProperties, cursorBlockStyle: React.CSSProperties, cursorCharacterStyle: React.CSSProperties, characterToShow: string): JSX.Element {
            return <StyledCursor style={containerStyle}>
                <div style={cursorBlockStyle} />
                <div style={cursorCharacterStyle}>{characterToShow}</div>
            </StyledCursor>
    }
}

export interface ICursorProps {
    typingPrediction: TypingPredictionManager
}

const mapStateToProps = (state: State.IState, props: ICursorProps): ICursorRendererProps => {
    return {
        ...props,
        animated: State.readConf(state.configuration, "ui.animations.enabled"),
        x: state.cursorPixelX, // + state.typingPredictions.length * state.cursorPixelWidth,
        y: state.cursorPixelY,
        scale: state.mode === "operator" ? 0.8 : state.cursorScale,
        width: state.cursorPixelWidth,
        height: state.fontPixelHeight,
        mode: state.mode,
        color: state.colors["editor.foreground"],
        textColor: state.colors["editor.background"],
        character: state.cursorCharacter,
        fontPixelWidth: state.fontPixelWidth,
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: addDefaultUnitIfNeeded(State.readConf(state.configuration, "editor.fontSize")),
        visible: !state.imeActive,
    }
}

export const Cursor = connect(mapStateToProps)(CursorRenderer)
