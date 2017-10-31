/**
 * NeovimSurface.tsx
 *
 * UI layer for the Neovim editor surface
 */

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../neovim"
import { INeovimRenderer } from "./../Renderer"
import { NeovimScreen } from "./../Screen"

import { ActiveWindowContainer } from "./../UI/components/ActiveWindow"
import { Cursor } from "./../UI/components/Cursor"
import { CursorLine } from "./../UI/components/CursorLine"
import { TabsContainer } from "./../UI/components/Tabs"
import { ToolTips } from "./../UI/components/ToolTip"

import { BufferScrollBarContainer } from "./../UI/containers/BufferScrollBarContainer"
import { DefinitionContainer } from "./../UI/containers/DefinitionContainer"
import { ErrorsContainer } from "./../UI/containers/ErrorsContainer"

import { NeovimInput } from "./NeovimInput"
import { NeovimRenderer } from "./NeovimRenderer"

export interface INeovimSurfaceProps {
    neovimInstance: NeovimInstance
    deltaRegionTracker: IncrementalDeltaRegionTracker
    renderer: INeovimRenderer
    screen: NeovimScreen

    onKeyDown?: (key: string) => void
    onBufferClose?: (bufferId: number) => void
    onBufferSelect?: (bufferId: number) => void
    onTabClose?: (tabId: number) => void
    onTabSelect?: (tabId: number) => void
}

export class NeovimSurface extends React.PureComponent<INeovimSurfaceProps, void> {
    public render(): JSX.Element {
        return <div className="container vertical full">
            <div className="container fixed">
                <TabsContainer
                    onBufferSelect={this.props.onBufferSelect}
                    onBufferClose={this.props.onBufferClose}
                    onTabClose={this.props.onTabClose}
                    onTabSelect={this.props.onTabSelect}/>
            </div>
            <div className="container full">
                <div className="stack">
                    <NeovimRenderer renderer={this.props.renderer}
                        neovimInstance={this.props.neovimInstance}
                        screen={this.props.screen} />
                </div>
                <div className="stack layer">
                    <Cursor />
                    <CursorLine lineType={"line"} />
                    <CursorLine lineType={"column"} />
                    <ActiveWindowContainer>
                        <DefinitionContainer />
                        <ErrorsContainer />
                        <BufferScrollBarContainer />
                    </ActiveWindowContainer>
                </div>
                <NeovimInput
                    neovimInstance={this.props.neovimInstance}
                    screen={this.props.screen}
                    onKeyDown={this.props.onKeyDown}/>
                <div className="stack layer">
                    <ToolTips />
                </div>
            </div>
        </div>
    }
}
