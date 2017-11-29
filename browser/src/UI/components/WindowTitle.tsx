/**
 * WindowTitle.tsx
 *
 * Renders the title bar (OSX only)
 */

import * as React from "react"

export interface IWindowTitleProps {
    visible: boolean
    title: string
    backgroundColor: string
    foregroundColor: string
}

export class WindowTitle extends React.PureComponent<IWindowTitleProps, {}> {

    public render(): null | JSX.Element {

        const style = {
            height: "22px",
            lineHeight: "22px",
            zoom: 1, // Don't allow this to be impacted by zoom
            backgroundColor: this.props.backgroundColor,
            foregroundColor: this.props.foregroundColor,
            textAlign: "center"
        }

        return <div style={style}>{this.props.title}</div>
    }
}
