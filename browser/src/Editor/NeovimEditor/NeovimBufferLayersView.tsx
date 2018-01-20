/**
 * NeovimLayersView.tsx
 *
 * Renders layers above vim windows
 */

import * as React from "react"
import { connect } from "react-redux"

import * as Oni from "oni-api"

import { NeovimActiveWindow } from "./NeovimActiveWindow"

import * as State from "./NeovimEditorStore"

import { EmptyArray } from "./../../Utility"

export interface NeovimBufferLayersViewProps {
    activeWindowId: number
    windows: State.IWindow[]
    layers: State.Layers
}

export class NeovimBufferLayersView extends React.PureComponent<NeovimBufferLayersViewProps, {}> {
    public render(): JSX.Element {

        const containers = this.props.windows.map((windowState) => {
            const layers = this.props.layers[windowState.bufferId] || (EmptyArray as Oni.EditorLayer[])

            const layerContext = {
                isActive: windowState.windowId === this.props.activeWindowId,
                windowId: windowState.windowId,

                bufferToScreen: windowState.bufferToScreen,
                screenToPixel: windowState.screenToPixel,
                dimensions: windowState.dimensions,
            }

            const layerElements = layers.map((l) => {
                return <div key={l.id}>{l.render(layerContext)}</div>
            })

            const dimensions = getWindowPixelDimensions(windowState)

            return <NeovimActiveWindow {...dimensions} key={windowState.windowId.toString()}>
                    {layerElements}
                </NeovimActiveWindow>
        })

        return <div className="stack layer">
                    {containers}
                </div>
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
        pixelY: start.pixelY,
        pixelWidth: size.pixelX,
        pixelHeight: size.pixelY,
    }
}

const mapStateToProps = (state: State.IState): NeovimBufferLayersViewProps => {
    if (!state.activeVimTabPage) {
        return {
            activeWindowId: -1,
            layers: {},
            windows: [],
        }
    }

    const windows = state.activeVimTabPage.windowIds.map((windowId) => {
        return state.windowState.windows[windowId]
    })

    const wins = windows.sort((a, b) => a.windowId - b.windowId)

    return {
        activeWindowId: state.windowState.activeWindow,
        windows: wins,
        layers: state.layers,
    }
}

export const NeovimBufferLayers = connect(mapStateToProps)(NeovimBufferLayersView)
