/**
 * NeovimSurface.tsx
 *
 * UI layer for the Neovim editor surface
 */

import * as React from "react"

import { IEvent } from "oni-types"

import { NeovimInstance, NeovimScreen } from "./../neovim"
import { INeovimRenderer } from "./../Renderer"

import { Cursor } from "./../UI/components/Cursor"
import { InstallHelp } from "./../UI/components/InstallHelp"
import { TabsContainer } from "./../UI/components/Tabs"
import { ToolTips } from "./../UI/components/ToolTip"

import { TypingPredictionManager } from "./../Services/TypingPredictionManager"

import { NeovimInput } from "./NeovimInput"
import { NeovimRenderer } from "./NeovimRenderer"

export interface INeovimSurfaceProps {
    neovimInstance: NeovimInstance
    renderer: INeovimRenderer
    screen: NeovimScreen
    typingPrediction: TypingPredictionManager

    onActivate: IEvent<void>

    onKeyDown?: (key: string) => void
    onBufferClose?: (bufferId: number) => void
    onBufferSelect?: (bufferId: number) => void
    onTabClose?: (tabId: number) => void
    onTabSelect?: (tabId: number) => void
}

export class NeovimSurface extends React.PureComponent<INeovimSurfaceProps, {}> {
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
                    <Cursor typingPrediction={this.props.typingPrediction}/>
                </div>
                <NeovimInput
                    onActivate={this.props.onActivate}
                    typingPrediction={this.props.typingPrediction}
                    neovimInstance={this.props.neovimInstance}
                    screen={this.props.screen}
                    onKeyDown={this.props.onKeyDown}/>
                <div className="stack layer">
                    <ToolTips />
                </div>
                <InstallHelp />
            </div>
        </div>
    }
}
