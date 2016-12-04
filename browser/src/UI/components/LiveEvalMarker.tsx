import * as React from "react"
import * as ReactDOM from "react-dom"

require("./LiveEvalMarker.less")

import { ILiveCodeBlock } from "./../../Services/LiveEvaluation"
import { /* IOverlay,*/ IWindowContext } from "./../OverlayManager"


export interface LiveEvalMarkerContainerProps {
    blocks: ILiveCodeBlock[]
    windowContext: IWindowContext
}

export class LiveEvalMarkerContainer extends React.Component<LiveEvalMarkerContainerProps, void> {
    public render(): JSX.Element {
        const blocks = this.props.blocks || []

        const blockComponents = blocks.map(b => {
            if (this.props.windowContext.isLineInView(b.startLine)) {
                const startY = this.props.windowContext.getWindowRegionForLine(b.startLine + 1).y
                const endY = this.props.windowContext.getWindowRegionForLine(b.endLine).y

                const result = b.result ? b.result.result : null

                return <LiveEvalMarker y={startY} height={endY - startY} result={result} />
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
            position: "absolute",
            top: this.props.y.toString() + "px",
            right: "0px",
            height: (this.props.height).toString() + "px",
            width: "250px"
        }

        return <div className="live-eval-marker" style={positionDivStyles}>{JSON.stringify(this.props.result)}</div>
    }
}

export function renderLiveEval(props: LiveEvalMarkerContainerProps, element: HTMLElement) {
    ReactDOM.render(<LiveEvalMarkerContainer {...props} />, element)
}

