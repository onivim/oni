/**
 * NeovimRenderer.tsx
 *
 * Layer responsible for invoking the INeovimRender strategy and applying to the DOM
 */

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { INeovimRenderer } from "./../Renderer"

export interface INeovimRendererProps {
    neovimInstance: NeovimInstance
    deltaRegionTracker: IncrementalDeltaRegionTracker
    renderer: INeovimRenderer
}

export class NeovimRenderer extends React.PureComponent<INeovimRendererProps, void> {

    private _element: HTMLDivElement
    private _boundOnResizeMethod: any

    public componentDidMount(): void {
        if (this._element) {
            this.props.renderer.start(this._element)

            this._onResize()
        }

        if (!this._boundOnResizeMethod) {
            this._boundOnResizeMethod = this._onResize.bind(this)
            window.addEventListener("resize", this._boundOnResizeMethod)
        }
    }

    public componentWillUnmount(): void {
        // TODO: Stop renderer

        if (this._boundOnResizeMethod) {
            window.removeEventListener("resize", this._boundOnResizeMethod)
            this._boundOnResizeMethod = null
        }
    }

    public render(): JSX.Element {
        return <div ref={ (elem) => this._element = elem } className="stack layer"></div>
    }

    private _onResize(): void {
        if (!this._element) {
            return
        }

        const width = this._element.offsetWidth
        const height = this._element.offsetHeight

        this.props.neovimInstance.resize(width, height)
        this.props.renderer.onResize()
    }
}
