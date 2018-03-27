/**
 * PluginsSidebarPane.tsx
 *
 * Sidebar pane for managing plugins
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { Configuration } from "./../Services/Configuration"
import { SidebarManager, SidebarPane } from "./../Services/Sidebar"

import { SidebarContainerView, SidebarItemView } from "./../UI/components/SidebarItemView"
import { VimNavigator } from "./../UI/components/VimNavigator"

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

    constructor(private _pluginManager: PluginManager) {}

    public enter(): void {
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

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
    defaultPluginsExpanded: boolean
    userPluginsExpanded: boolean
}

export class PluginsSidebarPaneView extends React.PureComponent<
    IPluginsSidebarPaneViewProps,
    IPluginsSidebarPaneViewState
> {
    private _subscriptions: IDisposable[] = []

    constructor(props: IPluginsSidebarPaneViewProps) {
        super(props)

        this.state = {
            isActive: false,
            defaultPluginsExpanded: false,
            userPluginsExpanded: true,
        }
    }

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
        const plugins = this.props.pluginManager.plugins

        const defaultPlugins = plugins.filter(p => p.source === "default")
        const userPlugins = plugins.filter(p => p.source === "user")

        const defaultPluginIds = this.state.defaultPluginsExpanded
            ? defaultPlugins.map(p => p.id)
            : []
        const userPluginIds = this.state.userPluginsExpanded ? userPlugins.map(p => p.id) : []

        const allIds = [
            "container.default",
            ...defaultPluginIds,
            "container.user",
            ...userPluginIds,
        ]

        return (
            <VimNavigator
                ids={allIds}
                active={this.state.isActive}
                render={(selectedId: string) => {
                    const defaultPluginItems = defaultPlugins.map(p => (
                        <SidebarItemView
                            indentationLevel={0}
                            isFocused={p.id === selectedId}
                            isContainer={false}
                            text={p.id}
                            onClick={() => {}}
                        />
                    ))

                    const userPluginItems = userPlugins.map(p => (
                        <SidebarItemView
                            indentationLevel={0}
                            isFocused={p.id === selectedId}
                            isContainer={false}
                            text={p.id}
                            onClick={() => {}}
                        />
                    ))

                    return (
                        <div>
                            <SidebarContainerView
                                text={"Default"}
                                isExpanded={this.state.defaultPluginsExpanded}
                                isFocused={selectedId === "container.default"}
                                onClick={() => {}}
                            >
                                {defaultPluginItems}
                            </SidebarContainerView>
                            <SidebarContainerView
                                text={"User"}
                                isExpanded={this.state.userPluginsExpanded}
                                isFocused={selectedId === "container.user"}
                                onClick={() => {}}
                            >
                                {userPluginItems}
                            </SidebarContainerView>
                        </div>
                    )
                }}
            />
        )
    }

    private _clearExistingSubscriptions(): void {
        this._subscriptions.forEach(sub => sub.dispose())
        this._subscriptions = []
    }
}

export const activate = (
    configuration: Configuration,
    pluginManager: PluginManager,
    sidebarManager: SidebarManager,
) => {
    if (configuration.getValue("sidebar.plugins.enabled")) {
        const pane = new PluginsSidebarPane(pluginManager)
        sidebarManager.add("plug", pane)
    }
}
