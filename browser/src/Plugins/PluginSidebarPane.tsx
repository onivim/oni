/**
 * PluginsSidebarPane.tsx
 *
 * Sidebar pane for managing plugins
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { SidebarManager, SidebarPane } from "./../Services/Sidebar"

import { PluginManager } from "./../Plugins/PluginManager"

export class PluginsSidebarPane implements SidebarPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    public get id(): string {
        return "oni.sidebar.plugins"
    }

    public get title(): string {
        return "Plugins"
    }

    public enter(): void {
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    constructor(private _pluginManager: PluginManager) {}

    public render(): JSX.Element {
        return (
            <PluginsSidebarPaneView
                onEnter={this._onEnter}
                onLeave={this._onLeave}
                pluginManager={this._pluginManager}
            />
        )
    }
}

export interface IPluginsSidebarPaneViewProps {
    onEnter: IEvent<void>
    onLeave: IEvent<void>

    pluginManager: PluginManager
}

export interface IPluginsSidebarPaneViewState {
    isActive: boolean
}

export class PluginsSidebarPaneView extends React.PureComponent<
    IPluginsSidebarPaneViewProps,
    IPluginsSidebarPaneViewState
> {
    private _subscriptions: IDisposable[] = []
    public componentDidMount(): void {
        this._clearExistingSubscriptions()

        const s2 = this.props.onEnter.subscribe(() => this.setState({ isActive: true }))
        const s3 = this.props.onLeave.subscribe(() => this.setState({ isActive: false }))

        this._subscriptions = [s2, s3]
    }

    public componentWillUnmount(): void {
        this._clearExistingSubscriptions()
    }

    public render(): JSX.Element {
        return (
            <div>
                {this.state.isActive} + {this.props.pluginManager.plugins.toString()}
            </div>
        )
    }

    private _clearExistingSubscriptions(): void {
        this._subscriptions.forEach(sub => sub.dispose())
        this._subscriptions = []
    }
}

export const activate = (pluginManager: PluginManager, sidebarManager: SidebarManager) => {
    const pane = new PluginsSidebarPane(pluginManager)
    sidebarManager.add("plug", pane)
}
