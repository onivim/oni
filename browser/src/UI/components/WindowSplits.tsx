/**
 * WindowSplits.tsx
 *
 * UI that hosts all the `Editor` instances
 */

import * as React from "react"

import { connect } from "react-redux"

import { WindowSplitHost } from "./WindowSplitHost"

import {
    IAugmentedSplitInfo,
    ISplitInfo,
    leftDockSelector,
    WindowManager,
    WindowState,
} from "./../../Services/WindowManager"

import { noop } from "./../../Utility"

export interface IWindowSplitsProps extends IWindowSplitsContainerProps {
    activeSplitId: string
    splitRoot: ISplitInfo<IAugmentedSplitInfo>
    leftDock: IAugmentedSplitInfo[]
}

export interface IWindowSplitsContainerProps {
    windowManager: WindowManager
}

export interface IDockProps {
    activeSplitId: string
    splits: IAugmentedSplitInfo[]
}

export class Dock extends React.PureComponent<IDockProps, {}> {
    public render(): JSX.Element {
        const docks = this.props.splits.map((s, i) => {
            return (
                <div style={{ display: "flex", flexDirection: "row" }} key={s.id}>
                    <WindowSplitHost
                        key={i}
                        containerClassName="split"
                        split={s}
                        isFocused={this.props.activeSplitId === s.id}
                        onClick={noop}
                    />
                    <div className="split-spacer vertical" />
                </div>
            )
        })

        return <div className="dock container fixed horizontal">{docks}</div>
    }
}

export interface IWindowSplitViewProps {
    activeSplitId: string
    split: ISplitInfo<IAugmentedSplitInfo>
    windowManager: WindowManager
}

import { layoutFromSplitInfo } from "./../../Services/WindowManager"

import { AutoSizer } from "react-virtualized"

const px = (num: number): string => num.toString() + "px"

const rectangleToStyleProperties = (rect: Oni.Shapes.Rectangle): React.CSSProperties => {
    const halfPadding = 3
    const topPosition = rect.y === 0 ? 0 : Math.ceil(rect.y) + halfPadding
    return {
        position: "absolute",
        top: px(topPosition),
        left: px(Math.ceil(rect.x) + halfPadding),
        width: px(Math.floor(rect.width) - halfPadding * 2),
        height: px(Math.floor(rect.height) - halfPadding * 2),
    }
}
import * as Oni from "oni-api"

export class WindowSplitView extends React.PureComponent<IWindowSplitViewProps, {}> {
    public render(): JSX.Element {
        const className = "container horizontal full"

        return (
            <div className={className}>
                <AutoSizer>
                    {({ height, width }) => {
                        // return <div>{width}{height}</div>
                        const items = layoutFromSplitInfo(this.props.split, width, height)
                        const vals: JSX.Element[] = Object.values(items).map(item => {
                            const style = rectangleToStyleProperties(item.rectangle)
                            return (
                                <div style={style}>
                                    <WindowSplitHost
                                        key={item.split.id}
                                        containerClassName="split"
                                        split={item.split}
                                        isFocused={this.props.activeSplitId === item.split.id}
                                        onClick={noop}
                                    />
                                </div>
                            )
                        })
                        return <div style={{ position: "relative" }}>{vals}</div>
                    }}
                </AutoSizer>
            </div>
        )
    }
}

export class WindowSplitsView extends React.PureComponent<IWindowSplitsProps, {}> {
    public render() {
        if (!this.props.splitRoot) {
            return null
        }

        const containerStyle: React.CSSProperties = {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
        }

        return (
            <div style={containerStyle}>
                <div className="container horizontal full">
                    <Dock splits={this.props.leftDock} activeSplitId={this.props.activeSplitId} />
                    <WindowSplitView
                        split={this.props.splitRoot}
                        windowManager={this.props.windowManager}
                        activeSplitId={this.props.activeSplitId}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (
    state: WindowState,
    containerProps: IWindowSplitsContainerProps,
): IWindowSplitsProps => {
    return {
        ...containerProps,
        activeSplitId: state.focusedSplitId,
        leftDock: leftDockSelector(state),
        splitRoot: state.primarySplit,
    }
}

export const WindowSplits = connect(mapStateToProps)(WindowSplitsView)
