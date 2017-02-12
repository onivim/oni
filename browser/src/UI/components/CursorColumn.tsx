import * as React from "react"
import { connect } from "react-redux"

import * as Config from "./../../Config"
import * as State from "./../State"

export interface ICursorColumnProps {
    x: number
    y: number
    width: number
    height: number
    color: string
    visible: boolean
}

// require("./Cursor.less") // tslint:disable-line no-var-requires

class CursorColumnRenderer extends React.Component<ICursorColumnProps, void> {

    public render(): null |  JSX.Element {
        if (!this.props.visible) {
            return null
        }


        const fontFamily = Config.getValue<string>("editor.fontFamily")
        const fontSize = Config.getValue<string>("editor.fontSize")
        const width = this.props.width

        // TODO: Add width

        const cursorStyle = {
            position: "absolute",
            left: this.props.x.toString() + "px", // Window Start
            top: this.props.y.toString() + "px", // Same as cursor
            width: width.toString() + "px", // Window width

            height: this.props.height.toString() + "px", // Same as cursor
            backgroundColor: this.props.color,
            opacity: 0.2,
            fontFamily,
            fontSize,
        }

        return <div style={cursorStyle} className="cursorLine"></div>
    }
}

const mapStateToProps = (state: State.IState) => {
    return {
        x: state.cursorPixelX,
        y: state.activeWindowDimensions.y,
        width: state.cursorPixelWidth,
        height: state.activeWindowDimensions.height,
        color: state.foregroundColor,
        visible: state.cursorColumnVisible,
    }
}

export const CursorColumn = connect(mapStateToProps)(CursorColumnRenderer)
