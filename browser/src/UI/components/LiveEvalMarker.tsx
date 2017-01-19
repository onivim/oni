import * as React from "react"
import * as ReactDOM from "react-dom"

import * as classNames from "classnames"

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

            if (!b.result) {
                return null
            }

            if (this.props.windowContext.isLineInView(b.startLine)) {
                const startY = this.props.windowContext.getWindowRegionForLine(b.startLine + 1).y
                const endY = this.props.windowContext.getWindowRegionForLine(b.endLine).y

                return <LiveEvalMarker y={startY} height={endY - startY} result={b.result} />
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

        const cssClasses = classNames("live-eval-marker", { "evaluating": this._isEvaluating() }, { "error": this._hasError() })

        const positionDivStyles = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            right: "0px",
            height: (this.props.height).toString() + "px",
            width: "250px",
        }

        return <div className={cssClasses} style={positionDivStyles}>
                <div className="text">{this._getText()}</div>
               </div>
    }

    private _hasError(): boolean {
        return !!(this.props.result && this.props.result.errors && this.props.result.errors.length)
    }

    private _hasResult(): boolean {
        return !!this.props.result
    }

    private _isEvaluating(): boolean {
        return !this._hasResult()
    }

    private _getText(): string {
        if (this._hasError() && this.props.result.errors) {
            return this.props.result.errors[0]
        } else if (this._hasResult() && this.props.result.result) {
            return this.props.result.result
        } else {
            return ""
        }
    }
}

export function renderLiveEval(props: ILiveEvalMarkerContainerProps, element: HTMLElement) {
    ReactDOM.render(<LiveEvalMarkerContainer {...props} />, element)
}
