/**
 * WindowTitle.tsx
 *
 * Renders the title bar (OSX only)
 */

import * as React from "react"

import { connect } from "react-redux"

import * as State from "./../State"

export interface IWindowTitleViewProps {
    visible: boolean
    title: string
    backgroundColor: string
    foregroundColor: string
}

export class WindowTitleView extends React.PureComponent<IWindowTitleViewProps, {}> {

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

export interface IWindowTitleProps {
    visible: boolean
}

export const mapStateToProps = (state: State.IState, props: IWindowTitleProps): IWindowTitleViewProps => {
    return {
        ...props,
        title: state.windowTitle,
        backgroundColor: "red", // TODO: Integrate theming
        foregroundColor: "white", // TODO: Integrate theming
    }
}

export const WindowTitle = connect(mapStateToProps)(WindowTitleView)
