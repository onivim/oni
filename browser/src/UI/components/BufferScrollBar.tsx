import * as React from "react"

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

export class BufferScrollBar extends React.PureComponent<IBufferScrollBarProps, {}> {

    constructor(props: any) {
        super(props)
    }

    public render(): JSX.Element {

        if (!this.props.visible) {
            return null
        }

        const windowHeight = ((this.props.windowBottomLine - this.props.windowTopLine + 1) / this.props.bufferSize) * this.props.height
        const windowTop = ((this.props.windowTopLine - 1) / this.props.bufferSize) * this.props.height

        const windowStyle: React.CSSProperties  = {
            top: windowTop + "px",
            height: windowHeight + "px",
        }

        const markers = this.props.markers || []

        const markerElements = markers.map((m) => {
            const line = m.line
            const pos = (line / this.props.bufferSize) * this.props.height
            const size = "2px"

            const markerStyle: React.CSSProperties = {
                position: "absolute",
                top: pos + "px",
                height: size,
                backgroundColor: m.color,
                width: "100%",
            }

            return <div style={markerStyle} key={m.line.toString() + m.color}/>
        })

        return <div className="scroll-bar-container">
                <div className="scroll-window" style={windowStyle}></div>
                {markerElements}
            </div>
    }
}
