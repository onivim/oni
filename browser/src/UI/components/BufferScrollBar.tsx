import * as React from "react"
import * as ReactDOM from "react-dom"

import * as Measure from "react-measure"

require("./BufferScrollBar.less")

export interface BufferScrollBarProps {
    bufferSize: number
    windowTopLine: number
    windowBottomLine: number
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
       const windowTop = ((this.props.windowTopLine-1) / this.props.bufferSize) * this.state.measuredHeight

        const windowStyle = {
            top: windowTop + "px",
            height: windowHeight + "px"
        }

        return <Measure onMeasure={(dimensions) => this._onMeasure(dimensions)}>
            <div className="scroll-bar-container">
                <div className="scroll-window" style={windowStyle}></div>
            </div>
        </Measure>
    }
}

export function renderBufferScrollBar(props: BufferScrollBarProps, element: HTMLElement) {
    ReactDOM.render(<BufferScrollBar {...props} />, element)
}

