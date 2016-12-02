import * as React from "react"
import * as ReactDOM from "react-dom"

import * as Measure from "react-measure"

require("./BufferScrollBar.less")

export interface BufferScrollBarProps {
    bufferSize: number
    windowTopLine: number
    windowBottomLine: number
    markers: ScrollBarMarker[]
}

export interface ScrollBarMarker {
    line: number
    height: number
    color: string
}

export interface BufferScrollState {
    measuredHeight: number
}

export class BufferScrollBar extends React.Component<BufferScrollBarProps, BufferScrollState> {

    constructor(props) {
        super(props)

        this.state = {
            measuredHeight: -1
        }
    }

    private _onMeasure(dimensions): void {
        this.setState({
            measuredHeight: dimensions.height
        })
    }

    public render(): JSX.Element {
        const windowHeight = ((this.props.windowBottomLine - this.props.windowTopLine) / this.props.bufferSize) * this.state.measuredHeight
        const windowTop = ((this.props.windowTopLine - 1) / this.props.bufferSize) * this.state.measuredHeight

        const windowStyle = {
            top: windowTop + "px",
            height: windowHeight + "px"
        }

        const markers = this.props.markers || []

        const markerElements = markers.map(m => {
            const line = m.line - 1
            const pos = (line / this.props.bufferSize) * this.state.measuredHeight
            const size = "2px"

            const markerStyle = {
                position: "absolute",
                top: pos + "px",
                height: size,
                backgroundColor: "red",
                width: "100%"
            }

            return <div style={markerStyle} />
        })

        return <Measure onMeasure={(dimensions) => this._onMeasure(dimensions)}>
            <div className="scroll-bar-container">
                <div className="scroll-window" style={windowStyle}></div>
                {markerElements}
            </div>
        </Measure>
    }
}

export function renderBufferScrollBar(props: BufferScrollBarProps, element: HTMLElement) {
    ReactDOM.render(<BufferScrollBar {...props} />, element)
}
