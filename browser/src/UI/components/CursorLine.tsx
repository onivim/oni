import * as React from "react"
import { connect } from "react-redux"
import * as Selectors from "./../Selectors"
import * as State from "./../State"

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

class CursorLineRenderer extends React.PureComponent<ICursorLineRendererProps, void> {

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

            height: this.props.height.toString() + "px", // Same as cursor
            backgroundColor: this.props.color,
            opacity: this.props.opacity,
        }

        return <div style={cursorStyle} className="cursorLine"></div>
    }
}

const mapStateToProps = (state: State.IState, props: ICursorLineProps) => {
    const opacitySetting = props.lineType === "line" ? "editor.cursorLineOpacity" : "editor.cursorColumnOpacity"
    const opacity = state.configuration[opacitySetting]

    const enabledSetting = props.lineType === "line" ? "editor.cursorLine" : "editor.cursorColumn"
    const enabled = state.configuration[enabledSetting]

    const isNormalInsertOrVisualMode = state.mode === "normal" || state.mode === "insert" || state.mode === "visual"

    const activeWindowDimensions = Selectors.getActiveWindowDimensions(state)

    return {
        x: props.lineType === "line" ? activeWindowDimensions.x : state.cursorPixelX,
        y: props.lineType === "line" ? state.cursorPixelY : activeWindowDimensions.y,
        width: props.lineType === "line" ? activeWindowDimensions.width : state.cursorPixelWidth,
        height: props.lineType === "line" ? state.fontPixelHeight : activeWindowDimensions.height,
        color: state.foregroundColor,
        visible: enabled && isNormalInsertOrVisualMode,
        opacity,
    }
}

export const CursorLine = connect(mapStateToProps)(CursorLineRenderer)
