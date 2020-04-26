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

import { clearBufferDecorations, updateBufferDecorations } from "./NeovimEditorActions"
import * as State from "./NeovimEditorStore"

import styled, { StackLayer } from "../../UI/components/common"

interface StateProps {
    activeWindowId: number
    windows: State.IWindow[]
    layers: State.Layers
    fontPixelWidth: number
    fontPixelHeight: number
    decorations: State.IDecorations
}

type UpdateDecorations = (decorations: State.IDecoration[], layerId: string) => void
type ClearDecorations = (layerId: string) => void

interface DispatchProps {
    updateBufferDecorations: UpdateDecorations
    clearBufferDecorations: ClearDecorations
}

export interface NeovimBufferLayersViewProps extends StateProps, DispatchProps {}

const InnerLayer = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    overflow: hidden;
`

export interface UpdatedLayerContext extends Oni.BufferLayerRenderContext {
    cursorLine: number
    cursorColumn: number
    decorations: State.IDecorations
    updateBufferDecorations: UpdateDecorations
    clearBufferDecorations: ClearDecorations
}

export class NeovimBufferLayersView extends React.PureComponent<NeovimBufferLayersViewProps, {}> {
    public render() {
        const containers = this.props.windows.map(windowState => {
            const layers: Oni.BufferLayer[] = this.props.layers[windowState.bufferId] || []

            const layerContext: UpdatedLayerContext = {
                isActive: windowState.windowId === this.props.activeWindowId,
                windowId: windowState.windowId,
                fontPixelWidth: this.props.fontPixelWidth,
                fontPixelHeight: this.props.fontPixelHeight,
                bufferToScreen: windowState.bufferToScreen,
                screenToPixel: windowState.screenToPixel,
                bufferToPixel: windowState.bufferToPixel,
                dimensions: windowState.dimensions,
                visibleLines: windowState.visibleLines,
                topBufferLine: windowState.topBufferLine,
                bottomBufferLine: windowState.bottomBufferLine,
                cursorColumn: windowState.column,
                cursorLine: windowState.line,
                decorations: this.props.decorations,
                updateBufferDecorations: this.props.updateBufferDecorations,
                clearBufferDecorations: this.props.clearBufferDecorations,
            }

            const layerElements = layers.map(layer => {
                return (
                    <InnerLayer key={`${layer.id}.${windowState.windowId}.${windowState.bufferId}`}>
                        {layer.render(layerContext)}
                    </InnerLayer>
                )
            })

            const dimensions = getWindowPixelDimensions(windowState)

            return (
                <NeovimActiveWindow {...dimensions} key={windowState.windowId.toString()}>
                    {layerElements}
                </NeovimActiveWindow>
            )
        })

        return <StackLayer>{containers}</StackLayer>
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

const EmptyState: StateProps = {
    activeWindowId: -1,
    layers: {},
    windows: [],
    fontPixelHeight: -1,
    fontPixelWidth: -1,
    decorations: {},
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

const mapStateToProps = (state: State.IState) => {
    if (!state.activeVimTabPage) {
        return EmptyState
    }

    const windows = windowSelector(state)

    return {
        windows,
        layers: state.layers,
        activeWindowId: state.windowState.activeWindow,
        fontPixelWidth: state.fontPixelWidth,
        fontPixelHeight: state.fontPixelHeight,
        decorations: state.decorations,
    }
}

const mapDispatchToProps = {
    updateBufferDecorations,
    clearBufferDecorations,
}

export const NeovimBufferLayers = connect<StateProps, DispatchProps, {}>(
    mapStateToProps,
    mapDispatchToProps,
)(NeovimBufferLayersView)
