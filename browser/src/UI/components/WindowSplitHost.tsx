/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"
import { connect } from "react-redux"

import * as Oni from "oni-api"

import { Configuration } from "./../../Services/Configuration"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    containerClassName: string
    isFocused: boolean
}

function mapStateToProps(state: IState) {
    return {
        showSplit: state,
    }
}

/**
 * Component responsible for rendering an individual window split
 */
@connect<IWindowSplitHostProps>(mapStateToProps, { toggleSplit })
export class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {
    public render(): JSX.Element {
        const className =
            this.props.containerClassName + (this.props.isFocused ? " focus" : " not-focused")

        return (
            className.includes("editor") && (
                <div className="container vertical full">
                    <div className={className}>{this.props.split.render()}</div>
                </div>
            )
        )
    }
}
