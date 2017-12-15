import * as React from "react"
import { connect } from "react-redux"
import * as Selectors from "./../Selectors"
import * as State from "./../State"

import styled from "styled-components"
import { withProps } from "./common"

export interface ICursorLineRendererProps {
    x: number
    y: number
    width: number
    height: number
    color: string
    visible: boolean
    opacity: number
}

export interface ICursorLineProps {
    lineType: string
}

const StyledCursorLine = withProps<ICursorLineRendererProps>(styled.div)`
      position: "absolute",
      left: ${props => props.x}px; /* Window Start */
      top: ${props => props.y}px; /* Same as cursor */
      width: ${props => props.width}px; /* Window width */
      height: ${props => props.height ? props.height : "0"}px; /* Same as cursor */
      background-color: ${props => props.color};
      opacity: ${props => props.opacity};
      `

const CursorLineRenderer  = (props: ICursorLineRendererProps) => {
    if (!props.visible) {
        return null
    }
    return <StyledCursorLine {...props} />
}

const emptyProps: ICursorLineRendererProps = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: null,
    visible: false,
    opacity: 0,
}

const mapStateToProps = (state: State.IState, props: ICursorLineProps) => {
    const opacitySetting = props.lineType === "line" ? "editor.cursorLineOpacity" : "editor.cursorColumnOpacity"
    const opacity = state.configuration[opacitySetting]

    const enabledSetting = props.lineType === "line" ? "editor.cursorLine" : "editor.cursorColumn"
    const enabled = state.configuration[enabledSetting]

    const isNormalInsertOrVisualMode = state.mode === "normal" || state.mode === "insert" || state.mode === "visual"
    const visible = enabled && isNormalInsertOrVisualMode

    if (!visible) {
        return emptyProps
    }

    const activeWindowDimensions = Selectors.getActiveWindowPixelDimensions(state)

    return {
        x: props.lineType === "line" ? activeWindowDimensions.x : state.cursorPixelX,
        y: props.lineType === "line" ? state.cursorPixelY : activeWindowDimensions.y,
        width: props.lineType === "line" ? activeWindowDimensions.width : state.cursorPixelWidth,
        height: props.lineType === "line" ? state.fontPixelHeight : activeWindowDimensions.height,
        color: state.colors["editore.foreground"],
        visible,
        opacity,
    }
}

export const CursorLine = connect(mapStateToProps)(CursorLineRenderer)
