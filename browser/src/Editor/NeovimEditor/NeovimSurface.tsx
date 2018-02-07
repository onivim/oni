/**
 * NeovimSurface.tsx
 *
 * UI layer for the Neovim editor surface
 */

import * as React from "react"
import { connect } from "react-redux"

import { IEvent } from "oni-types"

import { NeovimInstance, NeovimScreen } from "./../../neovim"
import { INeovimRenderer } from "./../../Renderer"

import { Cursor } from "./../../UI/components/Cursor"
import { CursorLine } from "./../../UI/components/CursorLine"
import { InstallHelp } from "./../../UI/components/InstallHelp"
import { TabsContainer } from "./../../UI/components/Tabs"
import { ToolTips } from "./../../UI/components/ToolTip"
import { TypingPrediction } from "./../../UI/components/TypingPredictions"

import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"

import { setViewport } from "./../NeovimEditor/NeovimEditorActions"
import { NeovimBufferLayers } from "./NeovimBufferLayersView"
import { NeovimEditorLoadingOverlay } from "./NeovimEditorLoadingOverlay"
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
    onImeStart: () => void
    onImeEnd: () => void
    onBounceStart: () => void
    onBounceEnd: () => void
    onTabClose?: (tabId: number) => void
    onTabSelect?: (tabId: number) => void
    setViewport: any
}

class NeovimSurface extends React.Component<INeovimSurfaceProps> {
    private observer: any
    private _editor: HTMLDivElement

    public componentDidMount(): void {
        // tslint:disable-next-line
        this.observer = new window["ResizeObserver"](([entry]: any) => {
            this.setDimensions(entry.contentRect.width, entry.contentRect.height)
        })

        this.observer.observe(this._editor)
    }

    public setDimensions = (width: number, height: number) => {
        this.props.setViewport(width, height)
    }

    public componentDidCatch(e: Error) {
        // TODO Add an Error Page to inform user of how to proceed e.g. file bug report
        // also pass error detais so user can file those
        // tslint:disable-next-line
        console.warn(`Error mounting the Neovim editor because`, e)
    }

    public render(): JSX.Element {
        return (
            <div className="container vertical full">
                <div className="container fixed">
                    <TabsContainer
                        onBufferSelect={this.props.onBufferSelect}
                        onBufferClose={this.props.onBufferClose}
                        onTabClose={this.props.onTabClose}
                        onTabSelect={this.props.onTabSelect}
                    />
                </div>
                <div className="container full">
                    <div className="stack" ref={(e: HTMLDivElement) => (this._editor = e)}>
                        <NeovimRenderer
                            renderer={this.props.renderer}
                            neovimInstance={this.props.neovimInstance}
                            screen={this.props.screen}
                        />
                    </div>
                    <div className="stack layer">
                        <TypingPrediction typingPrediction={this.props.typingPrediction} />
                        <Cursor typingPrediction={this.props.typingPrediction} />
                        <CursorLine lineType={"line"} />
                        <CursorLine lineType={"column"} />
                    </div>
                    <NeovimInput
                        onActivate={this.props.onActivate}
                        typingPrediction={this.props.typingPrediction}
                        neovimInstance={this.props.neovimInstance}
                        screen={this.props.screen}
                        onBounceStart={this.props.onBounceStart}
                        onBounceEnd={this.props.onBounceEnd}
                        onImeStart={this.props.onImeStart}
                        onImeEnd={this.props.onImeEnd}
                        onKeyDown={this.props.onKeyDown}
                    />
                    <NeovimBufferLayers />
                    <div className="stack layer">
                        <ToolTips />
                    </div>
                    <NeovimEditorLoadingOverlay />
                    <InstallHelp />
                </div>
            </div>
        )
    }
}
export default connect(null, { setViewport })(NeovimSurface)
