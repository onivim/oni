/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"

import * as Oni from "oni-api"

import { RedErrorScreenView } from "./../components/RedErrorScreen"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    containerClassName: string
    isFocused: boolean
    onClick: (evt: React.MouseEvent<HTMLElement>) => void
}

export interface WindowSplitHostState {
    errorInfo: ErrorInfo
}

export interface ErrorInfo {
    error: Error
    info: React.ErrorInfo
}

/**
 * Component responsible for rendering an individual window split
 */
export class WindowSplitHost extends React.PureComponent<
    IWindowSplitHostProps,
    WindowSplitHostState
> {
    constructor(props: IWindowSplitHostProps) {
        super(props)

        this.state = {
            errorInfo: null,
        }

        // Error
        // React.ErrorInfo
    }

    public componentDidCatch(error: Error, info: React.ErrorInfo): void {
        this.setState({
            errorInfo: {
                error,
                info,
            },
        })
    }

    public render(): JSX.Element {
        if (this.state.errorInfo) {
            return (
                <div className="container vertical full">
                    <RedErrorScreenView
                        error={this.state.errorInfo.error}
                        info={this.state.errorInfo.info}
                    />
                </div>
            )
        }

        const className =
            this.props.containerClassName + (this.props.isFocused ? " focus" : " not-focused")
        return (
            <div className="container horizontal full">
                <div className="container vertical full"
                onClick={evt => (!this.props.isFocused ? this.props.onClick(evt) : null)}
            >
                    <div className={className}>{this.props.split.render()}</div>
                </div>
                <div className="split-spacer vertical" />
            </div>
        )
    }
}
