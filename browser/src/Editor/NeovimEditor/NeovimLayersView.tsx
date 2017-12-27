/**
 * ActiveWindow.tsx
 *
 * Helper component that is always sized and positioned around the currently
 * active window in Neovim.
 */

import * as React from "react"
import { connect } from "react-redux"

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

        return <div className="stack layer">
                {wins}
            </div>

    }
}

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
