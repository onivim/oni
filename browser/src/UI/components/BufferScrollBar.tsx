import * as React from "react"
import * as ReactDOM from "react-dom"
import * as types from "vscode-languageserver-types"

import { connect, Provider } from "react-redux"
import { store } from "./../index"
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

export interface IRenderBufferScrollBarArgs {
    bufferSize: number
    height: number
    windowTopLine: number
    windowBottomLine: number
    markers: IScrollBarMarker[]
}

const mapStateToProps = (state: State.IState): IBufferScrollBarProps => {
    const visible = state.configuration["editor.scrollBar.visible"]

    const activeWindow = Selectors.getActiveWindow(state)
    const dimensions = Selectors.getActiveWindowDimensions(state)

    const errors = Selectors.getAllErrorsForFile(activeWindow.file, state)
    const errorMarkers = errors.map((e: types.Diagnostic) => ({
        line: e.range.start.line || 0,
        height: 1,
        color: getColorFromSeverity(e.severity),
    }))

    return {
        windowTopLine: activeWindow.windowTopLine,
        windowBottomLine: activeWindow.windowBottomLine,
        bufferSize: 100, // TODO
        markers: errorMarkers,
        height: dimensions.height,
        visible,
    }
}

const ConnectedBufferScrollBar = connect(mapStateToProps)(BufferScrollBar)

export function renderBufferScrollBar(props: IRenderBufferScrollBarArgs, element: HTMLElement) {
    ReactDOM.render(<Provider store={store}>
                        <ConnectedBufferScrollBar {...props} />
                    </Provider>, element)
}
