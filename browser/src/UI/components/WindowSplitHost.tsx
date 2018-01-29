/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as Oni from "oni-api"
import * as React from "react"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    containerClassName: string
    isFocused: boolean
}

/**
 * Component responsible for rendering an individual window split
 */
class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {
    public render(): JSX.Element {
        const className =
            this.props.containerClassName + (this.props.isFocused ? " focus" : " not-focused")
        return (
            <div className="container vertical full">
                <div className={className}>{this.props.split.render()}</div>
            </div>
        )
    }
}

export default WindowSplitHost
