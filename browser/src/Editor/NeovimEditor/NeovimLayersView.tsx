/**
 * ActiveWindow.tsx
 *
 * Helper component that is always sized and positioned around the currently
 * active window in Neovim.
 */

import * as React from "react"
import { connect } from "react-redux"

import { NeovimActiveWindow } from "./NeovimActiveWindow"

// import * as Selectors from "./NeovimEditorSelectors"
import * as State from "./NeovimEditorStore"

export interface NeovimLayersViewProps {
    windows: State.IWindow[]
}

export class NeovimLayersView extends React.PureComponent<NeovimLayersViewProps, {}> {
    public render(): JSX.Element {

        const wins = this.props.windows.map((windowState) => {
            return <div>{JSON.stringify(windowState)}</div>
        })

        const containers = this.props.windows.map((windowState) => {
            const dimensions = getWindowPixelDimensions(windowState)
            return <NeovimActiveWindow {...dimensions}>
                    <div style={{width: "100%", height: "100%", backgroundColor: "rgba(255, 0, 0, 0.2)" }} />
                </NeovimActiveWindow>
        })

        return <div className="stack layer">
                {wins}
                {containers}
            </div>

    }
}
const getWindowPixelDimensions = (win: State.IWindow) => {
    const start = win.screenToPixel({
        screenX: win.dimensions.x,
        screenY: win.dimensions.y
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

// const mapWindowsToProps = (state: State.IState): INeovimWindowsProps => {
//     const windows = Object.values(state.windowState.windows).filter((w) => w.dimensions)

//     return {
//         windows
//     }
// }


export const mapStateToProps = (state: State.IState): NeovimLayersViewProps => {

    if (!state.activeVimTabPage) {
        return {
            windows: [],
        }
    }

    const windows = state.activeVimTabPage.windowIds.map((windowId) => {
        return state.windowState.windows[windowId]
    })

    return {
        windows,
    }
}

export const NeovimLayers = connect(mapStateToProps)(NeovimLayersView)
