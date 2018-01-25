/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as Oni from "oni-api"
import * as React from "react"
import { connect } from "react-redux"
import { /* ISetViewportAction, */ setViewport } from "./../../Editor/NeovimEditor/NeovimEditorActions"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    containerClassName: string
    isFocused: boolean
    setViewport: any
    // (w: number, h: number, s?: { width: number; height: number }) => ISetViewportAction
}

/**
 * Component responsible for rendering an individual window split
 */
class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {
    private _editor: HTMLDivElement

    public componentDidMount(): void {
        this.setDimensions()
        this._editor.addEventListener("resize", this.setDimensions)
    }

    public setDimensions = () => {
        if (this.props.containerClassName.includes("editor")) {
            const height = document.body.clientHeight
            const width = document.body.clientWidth
            const editor = {
                width: this._editor.offsetWidth,
                height: this._editor.offsetHeight,
            }
            console.log("width: ", width)
            console.log("height: ", height)
            this.props.setViewport(width, height, editor)
        }
    }

    public render(): JSX.Element {
        const className =
            this.props.containerClassName + (this.props.isFocused ? " focus" : " not-focused")
        return (
            <div className="container vertical full">
                <div className={className} ref={(e: HTMLDivElement) => (this._editor = e)}>
                    {this.props.split.render()}
                </div>
            </div>
        )
    }
}

export default connect(null, { setViewport })(WindowSplitHost)
