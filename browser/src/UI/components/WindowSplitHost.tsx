/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"

import * as Oni from "oni-api"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
}

/**
 * Component responsible for rendering an individual window split
 */
export class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {

    public render(): JSX.Element {
        return <div className="container vertical full">
                <div className="editor">
                    {this.props.split.render()}
                </div>
        </div>
    }
}
