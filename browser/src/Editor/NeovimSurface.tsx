/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../NeovimInstance"
import { DOMRenderer } from "./../Renderer/DOMRenderer"
import { NeovimScreen } from "./../Screen"

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
            <NeovimInput neovimInstance={this.props.neovimInstance}
                screen={this.props.screen} />
        </div>
    }
}
