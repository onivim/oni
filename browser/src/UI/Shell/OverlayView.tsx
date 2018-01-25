/**
 * OverlayView.ts
 *
 * React component responsible for showing / rendering overlays
 */

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./ShellState"

export interface IOverlaysViewProps {
    overlays: State.IOverlay[]
}

export class OverlaysView extends React.PureComponent<IOverlaysViewProps, {}> {
    public render(): JSX.Element[] {
        const overlays = this.props.overlays.map(overlay => {
            return (
                <div className="stack layer" key={overlay.id}>
                    {overlay.contents}
                </div>
            )
        })

        return overlays
    }
}

export const mapStateToProps = (state: State.IState): IOverlaysViewProps => ({
    overlays: Object.keys(state.overlays).map(k => state.overlays[k]),
})

export const Overlays = connect(mapStateToProps)(OverlaysView)
