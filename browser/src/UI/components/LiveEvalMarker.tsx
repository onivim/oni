import * as React from "react"
import * as ReactDOM from "react-dom"

require("./LiveEvalMarker.less")

import { LiveCodeBlock } from "./../../Services/LiveEvaluation"
import { IOverlay, IWindowContext } from "./../OverlayManager"


export interface LiveEvalMarkerContainerProps {
    blocks: LiveCodeBlock[]
    windowContext: IWindowContext
}

export class LiveEvalMarkerContainer extends React.Component<LiveEvalMarkerContainerProps, void> {
    public render(): JSX.Element {
        const blocks = this.props.blocks || []

        const blockComponents = blocks.map(b => {
            if (this.props.windowContext.isLineInView(b.startLine)) {
                const startY = this.props.windowContext.getWindowLine(b.startLine)

                return <LiveEvalMarker y={startY} height={50} result={b.result} />
            } else {
                return null
            }
        })

        return <div>{blockComponents}</div>
    }
}

export interface LiveEvalMarkerProps {
    y: number
    height: number
    result: Oni.Plugin.EvaluationResult
}

export class LiveEvalMarker extends React.Component<LiveEvalMarkerProps, void> {

    public render(): JSX.Element {

        const positionDivStyles = {
            top: this.props.y.toString() + "px",
            right: "0px",
            height: (this.props.height).toString() + "px",
            width: "250px"
        }

        return <div style={positionDivStyles}>JSON.stringify(this.props.result)</div>
    }
}

export function renderLiveEval(props: LiveEvalMarkerContainerProps, element: HTMLElement) {
    ReactDOM.render(<LiveEvalMarkerContainer {...props} />, element)
}

