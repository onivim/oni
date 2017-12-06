/**
 * WindowSplits.tsx
 *
 * UI that hosts all the `Editor` instances
 */

import * as React from "react"

import * as Oni from "oni-api"
import { EditorSplitHost, WindowSplitHost } from "./WindowSplitHost"

import { DockPosition, WindowManager } from "./../../Services/WindowManager"
import { ISplitInfo } from "./../../Services/WindowSplit"

export interface IWindowSplitsProps {
    windowManager: WindowManager
}

export interface IWindowSplitsState {
    activeSplit: Oni.IWindowSplit
    splitRoot: ISplitInfo<Oni.IWindowSplit>
    leftDock: Oni.IWindowSplit[]
}

export interface IDockProps {
    activeSplit: Oni.IWindowSplit
    splits: Oni.IWindowSplit[]
}

export class Dock extends React.PureComponent<IDockProps, {}> {
    public render(): JSX.Element {

        const docks = this.props.splits.map((s) => <WindowSplitHost split={s} isFocused={this.props.activeSplit === s} />)

        return <div className="dock container fixed horizontal">
            {docks}
        </div>
    }
}

export class WindowSplits extends React.PureComponent<IWindowSplitsProps, IWindowSplitsState> {

    constructor(props: IWindowSplitsProps) {
        super(props)

        this.state = {
            activeSplit: props.windowManager.activeSplit,
            splitRoot: props.windowManager.splitRoot,
            leftDock: props.windowManager.getDocks(DockPosition.Left),
        }
    }

    public componentDidMount(): void {

        this.props.windowManager.onActiveSplitChanged.subscribe((newSplit) => {
            this.setState({
                activeSplit: newSplit,
            })
        })

        this.props.windowManager.onSplitChanged.subscribe((newSplit) => {
            this.setState({
                splitRoot: newSplit,
            })
        })

        this.props.windowManager.onDocksChanged.subscribe(() => {
            this.setState({
                leftDock: this.props.windowManager.getDocks(DockPosition.Left),
            })
        })
    }

    public render() {
        if (!this.state.splitRoot) {
            return null
        }

        const containerStyle: React.CSSProperties = {
            "display": "flex",
            "flexDirection": "row",
            "width": "100%",
            "height": "100%",
        }

        const editors = this.state.splitRoot.splits.map((splitNode, i) => {
            if (splitNode.type === "Split") {
                return null
            } else {
                const split: Oni.IWindowSplit = splitNode.contents

                if (!split) {
                    return <div className="container vertical full" key={i}>TODO: Implement an editor here...</div>
                } else {
                    return <EditorSplitHost split={split} isFocused={split === this.state.activeSplit} />
                }
            }
        })

        return <div style={containerStyle}>
                <div className="container horizontal full">
                    <Dock splits={this.state.leftDock} activeSplit={this.state.activeSplit}/>
                    {editors}
                </div>
                </div>
    }
}
