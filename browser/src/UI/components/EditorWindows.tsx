/**
 * EditorWindows.tsx
 *
 * UI that hosts all the `Editor` instances
 */

import * as React from "react"

import { EditorHost } from "./EditorHost"

import { WindowManager } from "./../../Services/WindowManager"
import { ISplitInfo } from "./../../Services/WindowSplit"

export interface IEditorWindowsProps {
    windowManager: WindowManager
}

export interface IEditorWindowsState {
    splitRoot: ISplitInfo<Oni.Editor>
}

export class EditorWindows extends React.PureComponent<IEditorWindowsProps, IEditorWindowsState> {

    constructor(props: IEditorWindowsProps) {
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

        const containerStyle = {
            "display": "flex",
            "flex-direction": "row",
            "width": "100%",
            "height": "100%",
        }

        const editors = this.state.splitRoot.splits.map((split) => {
            if (split.type === "Split") {
                return null
            } else {
                const anyEditor: any = split.contents

                if (!anyEditor) {
                    return <div className="container vertical full">TODO: Implement an editor here...</div>
                } else {
                    return <EditorHost editor={anyEditor} />
                }
            }
        })

        return <div style={containerStyle}>
                    {editors}
                </div>
    }
}
