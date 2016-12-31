import * as React from "react"
import * as ReactDOM from "react-dom"

require("./LiveEvalMarker.less") // tslint:disable-line no-var-requires

import { ILiveCodeBlock } from "./../../Services/LiveEvaluation"
import { WindowContext } from "./../Overlay/WindowContext"

export interface ILiveEvalMarkerContainerProps {
    blocks: ILiveCodeBlock[]
    windowContext: WindowContext
}

export class LiveEvalMarkerContainer extends React.Component<ILiveEvalMarkerContainerProps, void> {
    public render(): JSX.Element {
        const blocks = this.props.blocks || []

        const blockComponents = blocks.map((b) => {
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

export interface ILiveEvalMarkerProps {
    y: number
    height: number
    result: Oni.Plugin.EvaluationResult
}

export class LiveEvalMarker extends React.Component<ILiveEvalMarkerProps, void> {

    public render(): JSX.Element {

        const positionDivStyles = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            right: "0px",
            height: (this.props.height).toString() + "px",
            width: "250px",
        }

        return <div className="live-eval-marker" style={positionDivStyles}>{JSON.stringify(this.props.result)}</div>
    }
}

export function renderLiveEval(props: ILiveEvalMarkerContainerProps, element: HTMLElement) {
    ReactDOM.render(<LiveEvalMarkerContainer {...props} />, element)
}
