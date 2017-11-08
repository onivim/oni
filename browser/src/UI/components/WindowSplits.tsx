/**
 * WindowSplits.tsx
 *
 * UI that hosts all the `Editor` instances
 */

import * as React from "react"

import { WindowSplitHost } from "./WindowSplitHost"

import { DockPosition, WindowManager } from "./../../Services/WindowManager"
import { ISplitInfo } from "./../../Services/WindowSplit"

export interface IWindowSplitsProps {
    windowManager: WindowManager
}

export interface IWindowSplitsState {
    splitRoot: ISplitInfo<Oni.IWindowSplit>

    topDockedSplits: Oni.IWindowSplit[]
    bottomDockedSplits: Oni.IWindowSplit[]
    leftDockedSplits: Oni.IWindowSplit[]
    rightDockedSplits: Oni.IWindowSplit[]
}

export interface IDockProps {
    splits: Oni.IWindowSplit[]
}

export class Dock extends React.PureComponent<IDockProps, {}> {
    public render(): JSX.Element {

        const splits = this.props.splits.map((s) => s.render())

        return <div className="container horizontal full">
            {splits}
        </div>

    }
}

export class WindowSplits extends React.PureComponent<IWindowSplitsProps, IWindowSplitsState> {

    constructor(props: IWindowSplitsProps) {
        super(props)

        this.state = {
            splitRoot: props.windowManager.splitRoot,
            topDockedSplits: [],
            bottomDockedSplits: [],
            leftDockedSplits: props.windowManager.getDocks(DockPosition.Left),
            rightDockedSplits: props.windowManager.getDocks(DockPosition.Right),
        }
    }

    public componentDidMount(): void {
        this.props.windowManager.onSplitChanged.subscribe((newSplit) => {
            this.setState({
                splitRoot: newSplit,
            })
        })

        this.props.windowManager.onDocksChanged.subscribe(() => {
            this.setState({
                leftDockedSplits: this.props.windowManager.getDocks(DockPosition.Left),
                rightDockedSplits: this.props.windowManager.getDocks(DockPosition.Right)
            })
        })
    }

    public render() {
        if (!this.state.splitRoot) {
            return null
        }

        const containerStyle = {
            "display": "flex",
            "flex-direction": "horizontal",
            "width": "100%",
            "height": "100%",
        }

        const editors = this.state.splitRoot.splits.map((splitNode) => {
            if (splitNode.type === "Split") {
                return null
            } else {
                const split: Oni.IWindowSplit = splitNode.contents

                if (!split) {
                    return <div className="container vertical full">TODO: Implement an editor here...</div>
                } else {
                    return <WindowSplitHost split={split} />
                }
            }
        })

        return <div style={containerStyle}>
            <div className="dock container horizontal fixed">
                <Dock splits={this.state.leftDockedSplits} />
            </div>
            <div className="workspace container vertical full">
                {editors}
            </div>
            <div className="dock container horizontal fixed">
                <Dock splits={this.state.rightDockedSplits} />
            </div>
        </div>
    }
}
