/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"

import * as Oni from "oni-api"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    isFocused: boolean
}
/**
 * Component responsible for rendering an individual window split
 */
export class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {

    public render(): JSX.Element {
        const className = this.props.isFocused ? "split focus" : "split"

        return <div className={className}>
                {this.props.split.render()}
                </div>
    }
}

/**
 * Component responsible for rendering an individual window split
 */
export class EditorSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {

    public render(): JSX.Element {
        const className = this.props.isFocused ? "editor focus" : "editor"

        return <div className="container vertical full">
                 <div className={className}>
                {this.props.split.render()}
                </div>
        </div>
    }
}
