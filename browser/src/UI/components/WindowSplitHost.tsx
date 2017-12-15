/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"

import * as Oni from "oni-api"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    containerClassName: string
    isFocused: boolean
    isFixedSize?: boolean
}

/**
 * Component responsible for rendering an individual window split
 */
export class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {

    public render(): JSX.Element {

        const className = this.props.containerClassName + (this.props.isFocused ? " focus" : " not-focused")
        // const rootClassName = this.props.isFixedSize ? "container vertial fixed" : "container vertical full"
        const rootClassName = this.props.isFixedSize ? "container vertical fixed" : "container vertical full"

        return <div className={rootClassName}>
                <div className={className}>
                    {this.props.split.render()}
                </div>
        </div>
    }
}
