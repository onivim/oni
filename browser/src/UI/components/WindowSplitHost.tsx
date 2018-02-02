/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"
import { connect } from "react-redux"

import * as Oni from "oni-api"

import { commandManager } from "./../../Services/CommandManager"
import { toggleSplit } from "./../../UI/Shell/ShellActionCreators"
import { IToggleSplitAction } from "./../../UI/Shell/ShellActions"
import { IState } from "./../../UI/Shell/ShellState"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    containerClassName: string
    isFocused: boolean
    showSplit: boolean
    toggleSplit: () => IToggleSplitAction
}

const mapStateToProps = ({ splits, ...state }: IState) => ({
    showSplit: splits.isOpen,
})

/**
 * Component responsible for rendering an individual window split
 */
export class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {
    public componentDidMount() {
        commandManager.registerCommand({
            command: "split.toggle",
            name: "Split Toggle",
            detail: "Toggle the sidebar",
            execute: this.props.toggleSplit,
        })
    }
    public render(): JSX.Element {
        const className =
            this.props.containerClassName + (this.props.isFocused ? " focus" : " not-focused")

        if (className.includes("editor")) {
            return (
                <div className="container vertical full">
                    <div className={className}>{this.props.split.render()}</div>
                </div>
            )
        }

        return this.props.showSplit ? (
            <div className="container vertical full">
                <div className={className}>{this.props.split.render()}</div>
            </div>
        ) : null
    }
}
export default connect(mapStateToProps, { toggleSplit })(WindowSplitHost)
