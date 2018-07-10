/**
 * PluginsSidebarPane.tsx
 *
 * Sidebar pane for managing plugins
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { CommandManager } from "./../Services/CommandManager"
import { Configuration } from "./../Services/Configuration"
import { SidebarManager, SidebarPane } from "./../Services/Sidebar"

import { SidebarContainerView, SidebarItemView } from "./../UI/components/SidebarItemView"
import { VimNavigator } from "./../UI/components/VimNavigator"

import { PluginManager } from "./../Plugins/PluginManager"

import { noop } from "./../Utility"

import * as Common from "./../UI/components/common"

import styled from "styled-components"

const PluginIconWrapper = styled.div`
    background-color: rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
`

const PluginCommandsWrapper = styled.div`
    flex: 0 0 auto;
`

const PluginInfoWrapper = styled.div`
    flex: 1 1 auto;
    width: 100%;
    justify-content: center;
    display: flex;
    flex-direction: column;
    margin-left: 8px;
    margin-right: 8px;
`

const PluginTitleWrapper = styled.div`
    font-size: 1.1em;
`

export interface PluginSidebarItemViewProps {
    name: string
}

export class PluginSidebarItemView extends React.PureComponent<PluginSidebarItemViewProps, {}> {
    public render(): JSX.Element {
        return (
            <Common.Container direction={"horizontal"} fullWidth={true}>
                <Common.Fixed style={{ width: "40px", height: "40px" }}>
                    <Common.Center>
                        <PluginIconWrapper />
                    </Common.Center>
                </Common.Fixed>
                <PluginInfoWrapper>
                    <PluginTitleWrapper>{this.props.name}</PluginTitleWrapper>
                </PluginInfoWrapper>
                <PluginCommandsWrapper />
            </Common.Container>
        )
    }
}

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
    workspacePluginsExpanded: boolean
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
            workspacePluginsExpanded: false,
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
            "container.workspace",
            "container.user",
            ...userPluginIds,
        ]

        return (
            <VimNavigator
                ids={allIds}
                active={this.state.isActive}
                onSelected={id => this._onSelect(id)}
                render={(selectedId: string) => {
                    const defaultPluginItems = defaultPlugins.map(p => (
                        <SidebarItemView
                            indentationLevel={0}
                            isFocused={p.id === selectedId}
                            isContainer={false}
                            text={<PluginSidebarItemView name={p.name || p.id} />}
                            onClick={noop}
                        />
                    ))

                    const userPluginItems = userPlugins.map(p => (
                        <SidebarItemView
                            indentationLevel={0}
                            isFocused={p.id === selectedId}
                            isContainer={false}
                            text={<PluginSidebarItemView name={p.name || p.id} />}
                            onClick={noop}
                        />
                    ))

                    return (
                        <div>
                            <SidebarContainerView
                                text={"Bundled"}
                                isContainer={true}
                                isExpanded={this.state.defaultPluginsExpanded}
                                isFocused={selectedId === "container.default"}
                                onClick={() => this._onSelect("container.default")}
                            >
                                {defaultPluginItems}
                            </SidebarContainerView>
                            <SidebarContainerView
                                text={"Workspace"}
                                isContainer={true}
                                isExpanded={this.state.workspacePluginsExpanded}
                                isFocused={selectedId === "container.workspace"}
                                onClick={() => this._onSelect("container.workspace")}
                            >
                                {[]}
                            </SidebarContainerView>
                            <SidebarContainerView
                                text={"User"}
                                isContainer={true}
                                isExpanded={this.state.userPluginsExpanded}
                                isFocused={selectedId === "container.user"}
                                onClick={() => this._onSelect("container.user")}
                            >
                                {userPluginItems}
                            </SidebarContainerView>
                        </div>
                    )
                }}
            />
        )
    }

    private _onSelect(id: string): void {
        switch (id) {
            case "container.default":
                this._toggleDefaultPluginsExpanded()
                return
            case "container.user":
                this._toggleUserPluginsExpanded()
                return
        }
    }

    private _toggleDefaultPluginsExpanded(): void {
        this.setState({
            defaultPluginsExpanded: !this.state.defaultPluginsExpanded,
        })
    }

    private _toggleUserPluginsExpanded(): void {
        this.setState({
            userPluginsExpanded: !this.state.userPluginsExpanded,
        })
    }

    private _clearExistingSubscriptions(): void {
        this._subscriptions.forEach(sub => sub.dispose())
        this._subscriptions = []
    }
}

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    pluginManager: PluginManager,
    sidebarManager: SidebarManager,
) => {
    if (configuration.getValue("sidebar.plugins.enabled")) {
        const pane = new PluginsSidebarPane(pluginManager)
        sidebarManager.add("plug", pane)
    }

    const togglePlugins = () => {
        sidebarManager.toggleVisibilityById("oni.sidebar.plugins")
    }

    commandManager.registerCommand({
        command: "plugins.toggle",
        name: "Plugins: Toggle Visibility",
        detail: "Toggles the plugins pane in the sidebar",
        execute: togglePlugins,
        enabled: () => configuration.getValue("sidebar.plugins.enabled"),
    })
}
