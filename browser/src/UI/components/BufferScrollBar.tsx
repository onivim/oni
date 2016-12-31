import * as React from "react"
import * as ReactDOM from "react-dom"

import * as Measure from "react-measure"

require("./BufferScrollBar.less") // tslint:disable-line no-var-requires

export interface IBufferScrollBarProps {
    bufferSize: number
    windowTopLine: number
    windowBottomLine: number
    markers: IScrollBarMarker[]
}

export interface IScrollBarMarker {
    line: number
    height: number
    color: string
}

export interface IBufferScrollState {
    measuredHeight: number
}

export class BufferScrollBar extends React.Component<IBufferScrollBarProps, IBufferScrollState> {

    constructor(props: any) {
        super(props)

        this.state = {
            measuredHeight: -1,
        }
    }

    public render(): JSX.Element {
        const windowHeight = ((this.props.windowBottomLine - this.props.windowTopLine + 1) / this.props.bufferSize) * this.state.measuredHeight
        const windowTop = ((this.props.windowTopLine - 1) / this.props.bufferSize) * this.state.measuredHeight

        const windowStyle = {
            top: windowTop + "px",
            height: windowHeight + "px",
        }

        const markers = this.props.markers || []

        const markerElements = markers.map((m) => {
            const line = m.line - 1
            const pos = (line / this.props.bufferSize) * this.state.measuredHeight
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

        return <Measure onMeasure={(dimensions) => this._onMeasure(dimensions)}>
            <div className="scroll-bar-container">
                <div className="scroll-window" style={windowStyle}></div>
                {markerElements}
            </div>
        </Measure>
    }

    private _onMeasure(dimensions: any): void {
        this.setState({
            measuredHeight: dimensions.height,
        })
    }
}

export function renderBufferScrollBar(props: IBufferScrollBarProps, element: HTMLElement) {
    ReactDOM.render(<BufferScrollBar {...props} />, element)
}
