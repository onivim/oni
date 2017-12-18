import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

import { Motion, spring } from "react-motion"

import styled from "styled-components"
import { withProps } from "./common"

import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"

import { addDefaultUnitIfNeeded } from "./../../Font"

export interface ICursorRendererProps {
    animated: boolean
    x: number
    y: number
    scale: number
    width: number
    height: number
    isLoaded: boolean
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

function isInsertCursor(props: ICursorRendererProps) {
  return props.mode === "insert" || props.mode === "cmdline_normal"
}

const innerPositionStyle = `
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0px;
    top: 0px;
    `

const CursorBlock = withProps<{
  color: string,
  scale: number,
}>(styled.div)`
    ${innerPositionStyle}
    background-color: ${props => props.color};
    transform: scale(${props => props.scale});
    `

const CursorCharacter = withProps<{
  textColor: string,
}>(styled.div)`
    ${innerPositionStyle}
    text-align: center;
    color: ${props => props.textColor};
    `

const CursorContainer = withProps<ICursorRendererProps>(styled.div)`

    visibility: ${props => props.visible ? "visible" : "hidden"};
    position: absolute;
    left: ${props => props.x}px;
    top: ${props => props.y}px;
    width: ${props => isInsertCursor(props) ? "0" : props.width}px;
    height: ${props => props.height || "0"}px;
    line-height: ${props => props.height}px;
    color: ${props => props.textColor};
    font-family: ${props => props.fontFamily};
    font-size: ${props => props.fontSize};

    opacity: ${props => props.isLoaded ? 1 : 0};
    transition: opacity 0.35s ease 0.25s;

    /* Cover up 'holes' due to subpixel rendering on canvas */
    padding-left: 1px;
    padding-right: 1px;
    margin-left: -1px;
    `

export interface ICursorRendererState {
    predictedCursorColumn: number
}

export interface ICursorAnimationProps {
  scale: number
}

class CursorRenderer extends React.PureComponent<ICursorRendererProps, ICursorRendererState> {

    public state = {
        predictedCursorColumn: -1,
    }

    public componentDidMount(): void {
        this.props.typingPrediction.onPredictionsChanged.subscribe((predictions) => {
            this.setState({
                predictedCursorColumn: predictions.predictedCursorColumn,
            })
        })
    }

    public render(): JSX.Element {

        const characterToShow = isInsertCursor(this.props) ? "" : this.props.character

        const x = this.props.mode === "insert" && this.state.predictedCursorColumn >= 0
                  ? this.state.predictedCursorColumn * this.props.fontPixelWidth
                  : this.props.x

        const StyledCursor = ({ scale }: ICursorAnimationProps) => (
             <CursorContainer {...this.props} x={x}>
                <CursorBlock scale={scale} {...this.props} />
                <CursorCharacter textColor={this.props.textColor}>{characterToShow}</CursorCharacter>
            </CursorContainer>
        )

        if (!this.props.animated) {
            return <StyledCursor scale={1} />
        } else {
            return <Motion defaultStyle={{scale: 0}} style={{scale: spring(this.props.scale, { stiffness: 120, damping: 8})}}>
              {value => <StyledCursor scale={value.scale} />}
            </Motion>
        }
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
        isLoaded: state.isLoaded,
        textColor: state.colors["editor.background"],
        character: state.cursorCharacter,
        fontPixelWidth: state.fontPixelWidth,
        fontFamily: State.readConf(state.configuration, "editor.fontFamily"),
        fontSize: addDefaultUnitIfNeeded(State.readConf(state.configuration, "editor.fontSize")),
        visible: !state.imeActive,
    }
}

export const Cursor = connect(mapStateToProps)(CursorRenderer)
