import * as React from "react"
import * as ReactDOM from "react-dom"

require("./BufferScrollBar.less") // tslint:disable-line no-var-requires

export interface IBufferScrollBarProps {
    bufferSize: number
    height: number
    windowTopLine: number
    windowBottomLine: number
    markers: IScrollBarMarker[]
}

export interface IScrollBarMarker {
    line: number
    height: number
    color: string
}

export class BufferScrollBar extends React.Component<IBufferScrollBarProps, void> {

    constructor(props: any) {
        super(props)
    }

    public render(): JSX.Element {
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

export function renderBufferScrollBar(props: IBufferScrollBarProps, element: HTMLElement) {
    ReactDOM.render(<BufferScrollBar {...props} />, element)
}
