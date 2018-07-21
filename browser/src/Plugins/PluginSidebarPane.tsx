/**
 * PluginsSidebarPane.tsx
 *
 * Sidebar pane for managing plugins
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { CommandManager } from "./../Services/CommandManager"
import { Configuration } from "./../Services/Configuration"
import { SearchTextBox } from "./../Services/Search/SearchTextBox"
import { SidebarManager, SidebarPane } from "./../Services/Sidebar"

import { SidebarContainerView, SidebarItemView } from "./../UI/components/SidebarItemView"
import { VimNavigator } from "./../UI/components/VimNavigator"

import { PluginManager } from "./../Plugins/PluginManager"
import {
    CompositePluginRepository,
    PluginInfo,
    PluginRepository,
} from "./../Plugins/PluginRepository"

import { noop } from "./../Utility"

import * as Common from "./../UI/components/common"

import styled from "styled-components"

// const PluginIconWrapper = styled.div`
//     background-color: rgba(0, 0, 0, 0.1);
//     width: 36px;
//     height: 36px;
// `

// const PluginCommandsWrapper = styled.div`
//     flex: 0 0 auto;
// `

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
    font-weight: 700;
`

const PluginDescription = styled.div`
    font-size: 0.8em;
    white-space: pre-wrap;
`

export interface PluginSidebarItemViewProps {
    name: string
    description?: string | null
}

export class PluginSidebarItemView extends React.PureComponent<PluginSidebarItemViewProps, {}> {
    public render(): JSX.Element {
        return (
            <Common.Container direction={"horizontal"} fullWidth={true}>
                <PluginInfoWrapper>
                    <PluginTitleWrapper>{this.props.name}</PluginTitleWrapper>
                    <PluginDescription>
                        {this.props.description ? this.props.description : " "}
                    </PluginDescription>
                </PluginInfoWrapper>
            </Common.Container>
        )
    }
}

export class PluginsSidebarPane implements SidebarPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()
    private _pluginDiscovery = new CompositePluginRepository()

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
                pluginDiscovery={this._pluginDiscovery}
            />
        )
    }
}

export interface IPluginsSidebarPaneViewProps {
    onEnter: IEvent<void>
    onLeave: IEvent<void>

    pluginManager: PluginManager
    pluginDiscovery: PluginRepository
}

export interface IPluginsSidebarPaneViewState {
    isActive: boolean
    isSearchTextFocused: boolean
    searchText: string
    searchResults: PluginInfo[]
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
            isSearchTextFocused: false,
            searchText: "",
            searchResults: [],
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

        const isSearchActive = !!this.state.searchText
        const allIds = isSearchActive
            ? [
                  "textbox.query",
                  "container.searchResults",
                  ...this.state.searchResults.map(sr => sr.yarnInstallPackageName),
              ]
            : [
                  "textbox.query",
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

                    const pluginItems = isSearchActive ? (
                        <SidebarContainerView
                            text={"Search Results"}
                            isContainer={true}
                            isExpanded={true}
                            isFocused={selectedId === "container.searchResults"}
                            onClick={() => this._onSelect("container.searchResults")}
                        >
                            {this.state.searchResults.map(sr => (
                                <SidebarItemView
                                    indentationLevel={0}
                                    isFocused={selectedId === sr.yarnInstallPackageName}
                                    isContainer={false}
                                    text={
                                        <PluginSidebarItemView
                                            name={sr.name}
                                            description={sr.description}
                                        />
                                    }
                                    onClick={noop}
                                />
                            ))}
                        </SidebarContainerView>
                    ) : (
                        <React.Fragment>
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
                        </React.Fragment>
                    )

                    return (
                        <div>
                            <SearchTextBox
                                val={this.state.searchText || "Type to search.."}
                                onChangeText={newText => this._onSearchTextChanged(newText)}
                                onCommit={() => this._clearSearchText()}
                                onDismiss={() => this._clearSearchText()}
                                isFocused={selectedId === "textbox.query"}
                                isActive={this.state.isSearchTextFocused}
                                onClick={() => this._onSelect("textbox.query")}
                            />
                            {pluginItems}
                        </div>
                    )
                }}
            />
        )
    }

    private _onSearchTextChanged(searchText: string): void {
        this.setState({
            searchText,
        })

        const currentSearchText = searchText
        this.props.pluginDiscovery.searchPlugins(searchText).then(result => {
            if (searchText === currentSearchText && this.state.searchText) {
                this.setState({ searchResults: result })
            }
        })
    }

    private _clearSearchText(): void {
        this.setState({
            searchText: null,
            isSearchTextFocused: false,
        })
    }

    private _onSelect(id: string): void {
        switch (id) {
            case "container.default":
                this._toggleDefaultPluginsExpanded()
                return
            case "container.user":
                this._toggleUserPluginsExpanded()
                return
            case "textbox.query":
                this.setState({ isSearchTextFocused: true })
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
