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

import { Rectangle } from "./../UI/Types"
import * as State from "./../UI/State"
import * as Selectors from "./../UI/Selectors"
import { connect } from "react-redux"

export interface IActiveWindowProps {
    dimensions: Rectangle
}
export class ActiveWindow extends React.PureComponent<IActiveWindowProps, void> {
    public render(): JSX.Element {

        const px = (str: number): string => `${str}px`

        const style = {
            position: "absolute",
            left: px(this.props.dimensions.x),
            top: px(this.props.dimensions.y),
            width: px(this.props.dimensions.width),
            height: px(this.props.dimensions.height),
            backgroundColor: "rgba(255, 0, 0, 0.4)",
        }

        return <div style={style}>
                    {this.props.children}
               </div>
    }
}

const mapStateToProps = (state: State.IState): IActiveWindowProps => {
    return {
        dimensions: Selectors.getActiveWindowDimensions(state),
    }
}

export const ActiveWindowContainer = connect(mapStateToProps)(ActiveWindow)

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
            <div className="stack layer">
                <ActiveWindowContainer>
                    <div>hi</div>
                </ActiveWindowContainer>
            </div>
            <NeovimInput neovimInstance={this.props.neovimInstance}
                screen={this.props.screen} />
        </div>
    }
}
