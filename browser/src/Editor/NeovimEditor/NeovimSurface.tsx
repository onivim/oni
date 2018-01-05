/**
 * NeovimSurface.tsx
 *
 * UI layer for the Neovim editor surface
 */

import * as React from "react"

import { IEvent } from "oni-types"

import { NeovimInstance, NeovimScreen } from "./../../neovim"
import { INeovimRenderer } from "./../../Renderer"

import CommandLine from "./../../UI/components/CommandLine"
import { Cursor } from "./../../UI/components/Cursor"
import { CursorLine } from "./../../UI/components/CursorLine"
import ExternalMenus from "./../../UI/components/ExternalMenus"
import { InstallHelp } from "./../../UI/components/InstallHelp"
import { TabsContainer } from "./../../UI/components/Tabs"
import { ToolTips } from "./../../UI/components/ToolTip"
import { TypingPrediction } from "./../../UI/components/TypingPredictions"
import WildMenu from "./../../UI/components/WildMenu"

import { BufferScrollBarContainer } from "./containers/BufferScrollBarContainer"
import { DefinitionContainer } from "./containers/DefinitionContainer"
import { ErrorsContainer } from "./containers/ErrorsContainer"

import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"

import { NeovimActiveWindowContainer } from "./NeovimActiveWindow"
import { NeovimInput } from "./NeovimInput"
import { NeovimLayers } from "./NeovimLayersView"
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
    onImeStart: () => void
    onImeEnd: () => void
    onBounceStart: () => void
    onBounceEnd: () => void
    onTabClose?: (tabId: number) => void
    onTabSelect?: (tabId: number) => void
}

import styled, { keyframes } from "styled-components"

const keys = keyframes`
    0% { transform: rotateY(0deg); opacity: 0.1; }
    50% { transform: rotateY(180deg) scale(0.9); opacity: 0.2; }
    100% { transform: rotateY(360deg); opacity: 0.1; }
`

const LoadingContainer = styled.div`
    opacity: 0.4;

    img {
        animation: ${keys} 2.5s linear infinite;
    }
`

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
                <ExternalMenus>
                    <CommandLine />
                    <WildMenu />
                </ExternalMenus>
                <div className="stack">
                    <NeovimRenderer renderer={this.props.renderer}
                        neovimInstance={this.props.neovimInstance}
                        screen={this.props.screen} />
                </div>
                <div className="stack layer">
                    <TypingPrediction typingPrediction={this.props.typingPrediction}/>
                    <Cursor typingPrediction={this.props.typingPrediction}/>
                    <CursorLine lineType={"line"} />
                    <CursorLine lineType={"column"} />
                    <NeovimActiveWindowContainer>
                        <DefinitionContainer />
                        <ErrorsContainer />
                        <BufferScrollBarContainer />
                    </NeovimActiveWindowContainer>
                </div>
                <NeovimLayers />
                <NeovimInput
                    onActivate={this.props.onActivate}
                    typingPrediction={this.props.typingPrediction}
                    neovimInstance={this.props.neovimInstance}
                    screen={this.props.screen}
                    onBounceStart={this.props.onBounceStart}
                    onBounceEnd={this.props.onBounceEnd}
                    onImeStart={this.props.onImeStart}
                    onImeEnd={this.props.onImeEnd}
                    onKeyDown={this.props.onKeyDown}/>
                <div className="stack layer">
                    <ToolTips />
                </div>
                <InstallHelp />
                <div className="stack layer">
                    <LoadingContainer>
                        <img src="images/oni-icon-no-border.svg" style={{width: "128px", height: "128px"}} />
                    </LoadingContainer>
                </div>
            </div>
        </div>
    }
}
