/**
 * NeovimLayersView.tsx
 *
 * Renders layers above vim windows
 */

import * as React from "react"
import { connect } from "react-redux"
import { createSelector } from "reselect"

import * as Oni from "oni-api"

import { NeovimActiveWindow } from "./NeovimActiveWindow"

import * as State from "./NeovimEditorStore"

import { EmptyArray } from "./../../Utility"

export interface NeovimBufferLayersViewProps {
    activeWindowId: number
    windows: State.IWindow[]
    layers: State.Layers
    fontPixelWidth: number
    fontPixelHeight: number
}

const InnerLayerStyle: React.CSSProperties = {
    position: "absolute",
    top: "0px",
    left: "0px",
    right: "0px",
    bottom: "0px",
    overflowY: "auto",
    overflowX: "auto",
}

export class NeovimBufferLayersView extends React.PureComponent<NeovimBufferLayersViewProps, {}> {
    public render(): JSX.Element {
        const containers = this.props.windows.map(windowState => {
            const layers =
                this.props.layers[windowState.bufferId] || (EmptyArray as Oni.BufferLayer[])

            const layerContext = {
                isActive: windowState.windowId === this.props.activeWindowId,
                windowId: windowState.windowId,

                fontPixelWidth: this.props.fontPixelWidth,
                fontPixelHeight: this.props.fontPixelHeight,
                bufferToScreen: windowState.bufferToScreen,
                screenToPixel: windowState.screenToPixel,
                dimensions: windowState.dimensions,
            }

            const layerElements = layers.map(l => {
                return (
                    <div
                        key={
                            l.id +
                            "." +
                            windowState.windowId.toString() +
                            "." +
                            windowState.bufferId.toString()
                        }
                        style={InnerLayerStyle}
                    >
                        {l.render(layerContext)}
                    </div>
                )
            })

            const dimensions = getWindowPixelDimensions(windowState)

            return (
                <NeovimActiveWindow {...dimensions} key={windowState.windowId.toString()}>
                    {layerElements}
                </NeovimActiveWindow>
            )
        })

        return <div className="stack layer">{containers}</div>
    }
}

const EmptySize = {
    pixelX: -1,
    pixelY: -1,
    pixelWidth: 0,
    pixelHeight: 0,
}

const getWindowPixelDimensions = (win: State.IWindow) => {
    if (!win || !win.screenToPixel) {
        return EmptySize
    }

    const start = win.screenToPixel({
        screenX: win.dimensions.x,
        screenY: win.dimensions.y,
    })

    const size = win.screenToPixel({
        screenX: win.dimensions.width,
        screenY: win.dimensions.height,
    })

    return {
        pixelX: start.pixelX,
        pixelY: start.pixelY - 1,
        pixelWidth: size.pixelX,
        pixelHeight: size.pixelY + 2,
    }
}

const EmptyState: NeovimBufferLayersViewProps = {
    activeWindowId: -1,
    layers: {},
    windows: [],
    fontPixelHeight: -1,
    fontPixelWidth: -1,
}

const getActiveVimTabPage = (state: State.IState) => state.activeVimTabPage
const getWindowState = (state: State.IState) => state.windowState

const windowSelector = createSelector(
    [getActiveVimTabPage, getWindowState],
    (tabPage: State.IVimTabPage, windowState: State.IWindowState) => {
        const windows = tabPage.windowIds.map(windowId => {
            return windowState.windows[windowId]
        })

        return windows.sort((a, b) => a.windowId - b.windowId)
    },
)

const mapStateToProps = (state: State.IState): NeovimBufferLayersViewProps => {
    if (!state.activeVimTabPage) {
        return EmptyState
    }

    const windows = windowSelector(state)

    return {
        activeWindowId: state.windowState.activeWindow,
        windows,
        layers: state.layers,
        fontPixelWidth: state.fontPixelWidth,
        fontPixelHeight: state.fontPixelHeight,
    }
}

export const NeovimBufferLayers = connect(mapStateToProps)(NeovimBufferLayersView)
