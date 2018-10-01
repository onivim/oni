/**
 * NeovimRenderer.tsx
 *
 * Layer responsible for invoking the INeovimRender strategy and applying to the DOM
 */

import * as React from "react"

import { IScreen, NeovimInstance } from "./../../neovim"
import { INeovimRenderer } from "./../../Renderer"

export interface INeovimRendererProps {
    neovimInstance: NeovimInstance
    screen: IScreen
    renderer: INeovimRenderer
}

export class NeovimRenderer extends React.PureComponent<INeovimRendererProps, {}> {
    private _element: HTMLDivElement
    private _boundOnResizeMethod: any
    private _resizeObserver: any

    public componentDidMount(): void {
        if (this._element) {
            this.props.renderer.start(this._element)

            this._onResize()
        }

        if (!this._boundOnResizeMethod) {
            this._boundOnResizeMethod = this._onResize.bind(this)
            // tslint:disable-next-line no-string-literal
            this._resizeObserver = new window["ResizeObserver"]((entries: any) => {
                if (this._boundOnResizeMethod) {
                    this._boundOnResizeMethod()
                }
            })
            this._resizeObserver.observe(this._element)
        }
    }

    public componentWillUnmount(): void {
        // TODO: Stop renderer

        if (this._resizeObserver) {
            this._resizeObserver.disconnect()
            this._resizeObserver = null
        }

        if (this._boundOnResizeMethod) {
            this._boundOnResizeMethod = null
        }
    }

    public render(): JSX.Element {
        return <div ref={elem => (this._element = elem)} className="stack layer" />
    }

    private _onResize(): void {
        if (!this._element) {
            return
        }

        const width = this._element.offsetWidth
        const height = this._element.offsetHeight

        this.props.neovimInstance
            .resize(width, height)
            .then(() => this.props.renderer.redrawAll(this.props.screen))
    }
}
