/**
 * Loading.tsx
 *
 * Component to show loading experience
 */

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../Shell/ShellState"

export interface ILoadingViewProps {
    visible: boolean
    backgroundColor: string
}

export class LoadingView extends React.PureComponent<ILoadingViewProps, {}> {
    public render(): JSX.Element {
        const style: React.CSSProperties = {
            position: "absolute",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
            backgroundColor: this.props.backgroundColor,
            display: this.props.visible ? "block" : "none",
            opacity: 1,
            transition: "opacity 0.5s ease",
        }

        return <div style={style} />
    }
}

const mapStateToProps = (state: State.IState): ILoadingViewProps => {
    return {
        visible: !state.isLoaded,
        backgroundColor: state.colors.background,
    }
}

export const Loading = connect(mapStateToProps)(LoadingView)
