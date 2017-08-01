import * as React from "react"
import * as types from "vscode-languageserver-types"

import { connect } from "react-redux"
import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { getColorFromSeverity } from "./../../Services/Errors"

require("./BufferScrollBar.less") // tslint:disable-line no-var-requires

export interface IBufferScrollBarProps {
    bufferSize: number
    height: number
    windowTopLine: number
    windowBottomLine: number
    markers: IScrollBarMarker[]
    visible: boolean
}

export interface IScrollBarMarker {
    line: number
    height: number
    color: string
}

export class BufferScrollBar extends React.PureComponent<IBufferScrollBarProps, void> {

    constructor(props: any) {
        super(props)
    }

    public render(): JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const windowHeight = ((this.props.windowBottomLine - this.props.windowTopLine + 1) / this.props.bufferSize) * this.props.height
        const windowTop = ((this.props.windowTopLine - 1) / this.props.bufferSize) * this.props.height

        const windowStyle = {
            top: windowTop + "px",
            height: windowHeight + "px",
        }

        const markers = this.props.markers || []

        const markerElements = markers.map((m) => {
            const line = m.line - 1
            const pos = (line / this.props.bufferSize) * this.props.height
            const size = "2px"

            const markerStyle = {
                position: "absolute",
                top: pos + "px",
                height: size,
                backgroundColor: m.color,
                width: "100%",
            }

            return <div style={markerStyle} />
        })

        return <div className="scroll-bar-container">
                <div className="scroll-window" style={windowStyle}></div>
                {markerElements}
            </div>
    }
}

const NoScrollBar: IBufferScrollBarProps = {
    windowTopLine: 0,
    windowBottomLine: 0,
    bufferSize: 0,
    markers: [],
    height: 0,
    visible: false,
}

import { createSelector } from "reselect"

export const getMarkers = createSelector(
    [Selectors.getActiveWindow, Selectors.getErrors],
    (activeWindow, errors) => {

        const file = activeWindow.file
        const fileErrors = Selectors.getAllErrorsForFile(file, errors)

        const errorMarkers = fileErrors.map((e: types.Diagnostic) => ({
            line: e.range.start.line || 0,
            height: 1,
            color: getColorFromSeverity(e.severity),
        }))

        const cursorMarker: IScrollBarMarker = {
            line: activeWindow.line,
            height: 1,
            color: "rgb(200, 200, 200)",
        }

        return [...errorMarkers, cursorMarker]
    })

const mapStateToProps = (state: State.IState): IBufferScrollBarProps => {
    const visible = state.configuration["editor.scrollBar.visible"]

    const activeWindow = Selectors.getActiveWindow(state)

    if (!activeWindow) {
        return NoScrollBar
    }

    const dimensions = Selectors.getActiveWindowDimensions(state)

    const file = activeWindow.file

    if (file === null || !state.buffers[file]) {
        return NoScrollBar
    }

    const bufferSize = state.buffers[file].totalLines

    const markers = getMarkers(state)

    return {
        windowTopLine: activeWindow.windowTopLine,
        windowBottomLine: activeWindow.windowBottomLine,
        bufferSize,
        markers,
        height: dimensions.height,
        visible,
    }
}

export const ConnectedBufferScrollBar = connect(mapStateToProps)(BufferScrollBar)
