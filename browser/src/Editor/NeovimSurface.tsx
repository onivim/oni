/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { DOMRenderer } from "./../Renderer/DOMRenderer"
import { NeovimScreen } from "./../Screen"

import { Cursor } from "./../UI/components/Cursor"
import { CursorLine } from "./../UI/components/CursorLine"

import { NeovimInput } from "./NeovimInput"
import { NeovimRenderer } from "./NeovimRenderer"

export interface INeovimSurfaceProps {
    neovimInstance: NeovimInstance
    deltaRegionTracker: IncrementalDeltaRegionTracker
    renderer: DOMRenderer
    screen: NeovimScreen
}

export class NeovimSurface extends React.PureComponent<INeovimSurfaceProps, void> {
    public render(): JSX.Element {
        return <div className="editor">
            <NeovimRenderer renderer={this.props.renderer}
                neovimInstance={this.props.neovimInstance}
                deltaRegionTracker={this.props.deltaRegionTracker} />
            <div className="stack layer">
                <Cursor />
                <CursorLine lineType={"line"} />
                <CursorLine lineType={"column"} />
            </div>
            <NeovimInput neovimInstance={this.props.neovimInstance}
                screen={this.props.screen} />
        </div>
    }
}
