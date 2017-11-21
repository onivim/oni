/**
 * WindowSplits.tsx
 *
 * UI that hosts all the `Editor` instances
 */

import * as React from "react"

import * as Oni from "oni-api"

import { WindowSplitHost } from "./WindowSplitHost"

import { WindowManager } from "./../../Services/WindowManager"
import { ISplitInfo } from "./../../Services/WindowSplit"

export interface IWindowSplitsProps {
    windowManager: WindowManager
}

export interface IWindowSplitsState {
    splitRoot: ISplitInfo<Oni.IWindowSplit>
}

export class WindowSplits extends React.PureComponent<IWindowSplitsProps, IWindowSplitsState> {

    constructor(props: IWindowSplitsProps) {
        super(props)

        this.state = {
            splitRoot: props.windowManager.splitRoot,
        }
    }

    public componentDidMount(): void {
        this.props.windowManager.onSplitChanged.subscribe((newSplit) => {
            this.setState({
                splitRoot: newSplit,
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
                    {editors}
                </div>
    }
}
