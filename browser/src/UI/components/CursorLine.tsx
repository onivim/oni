import * as React from "react"
import { connect } from "react-redux"

import * as Selectors from "./../../Editor/NeovimEditor/NeovimEditorSelectors"
import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

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

class CursorLineRenderer extends React.PureComponent<ICursorLineRendererProps, {}> {

    public render(): null |  JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const width = this.props.width

        const cursorStyle: React.CSSProperties = {
            position: "absolute",
            left: this.props.x.toString() + "px", // Window Start
            top: this.props.y.toString() + "px", // Same as cursor
            width: width.toString() + "px", // Window width

            height: this.props.height ? this.props.height.toString() + "px" : "0px", // Same as cursor
            backgroundColor: this.props.color,
            opacity: this.props.opacity,
        }

        return <div style={cursorStyle} className="cursorLine"></div>
    }
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
