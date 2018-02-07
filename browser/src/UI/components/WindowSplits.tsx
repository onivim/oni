/**
 * WindowSplits.tsx
 *
 * UI that hosts all the `Editor` instances
 */

import * as React from "react"

import * as Oni from "oni-api"

import { WindowSplitHost } from "./WindowSplitHost"

import { ISplitInfo, WindowManager } from "./../../Services/WindowManager"

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
        const docks = this.props.splits.map((s, i) => {
            return (
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <WindowSplitHost
                        key={i}
                        containerClassName="split"
                        split={s}
                        isFocused={this.props.activeSplit === s}
                        onClick={() => {}}
                    />
                    <div className="split-spacer vertical" />
                </div>
            )
        })

        return <div className="dock container fixed horizontal">{docks}</div>
    }
}

export class WindowSplits extends React.PureComponent<IWindowSplitsProps, IWindowSplitsState> {
    constructor(props: IWindowSplitsProps) {
        super(props)

        this.state = {
            activeSplit: props.windowManager.activeSplit,
            splitRoot: props.windowManager.splitRoot,
            leftDock: [...props.windowManager.getDock("left").splits],
        }
    }

    public componentDidMount(): void {
        this.props.windowManager.onSplitChanged.subscribe(newSplit => {
            this.setState({
                splitRoot: newSplit,
            })
        })

        this.props.windowManager.getDock("left").onSplitsChanged.subscribe(() => {
            this.setState({
                leftDock: [...this.props.windowManager.getDock("left").splits],
            })
        })

        this.props.windowManager.onActiveSplitChanged.subscribe(newSplit => {
            this.setState({
                activeSplit: newSplit,
            })
        })
    }

    public render() {
        if (!this.state.splitRoot) {
            return null
        }

        const containerStyle: React.CSSProperties = {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
        }

        const editors = this.state.splitRoot.splits.map((splitNode, i) => {
            if (splitNode.type === "Split") {
                return null
            } else {
                const split: Oni.IWindowSplit = splitNode.contents

                if (!split) {
                    return (
                        <div className="container vertical full" key={i}>
                            TODO: Implement an editor here...
                        </div>
                    )
                } else {
                    return (
                        <WindowSplitHost
                            containerClassName={"editor"}
                            key={i}
                            split={split}
                            isFocused={split === this.state.activeSplit}
                            onClick={() => {
                                this.props.windowManager.focusSplit(split)
                            }}
                        />
                    )
                }
            }
        })

        // const spacer = this.state.leftDock.length > 0 ? <div className="split-spacer vertical" /> : null

        return (
            <div style={containerStyle}>
                <div className="container horizontal full">
                    <Dock splits={this.state.leftDock} activeSplit={this.state.activeSplit} />
                    {editors}
                </div>
            </div>
        )
    }
}
