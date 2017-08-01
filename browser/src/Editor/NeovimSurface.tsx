/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { INeovimRenderer } from "./../Renderer"
import { NeovimScreen } from "./../Screen"

import { ActiveWindowContainer } from "./../UI/components/ActiveWindow"
import { ConnectedBufferScrollBar } from "./../UI/components/BufferScrollBar"
import { Cursor } from "./../UI/components/Cursor"
import { CursorLine } from "./../UI/components/CursorLine"
import { ErrorsContainer } from "./../UI/components/Error"

import { NeovimInput } from "./NeovimInput"
import { NeovimRenderer } from "./NeovimRenderer"

export interface INeovimSurfaceProps {
    neovimInstance: NeovimInstance
    deltaRegionTracker: IncrementalDeltaRegionTracker
    renderer: INeovimRenderer
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
                <ActiveWindowContainer>
                    <ErrorsContainer />
                    <ConnectedBufferScrollBar />
                </ActiveWindowContainer>
            </div>
            <NeovimInput neovimInstance={this.props.neovimInstance}
                screen={this.props.screen} />
        </div>
    }
}
