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
import { Plugin } from "./../Plugins/Plugin"

import { noop } from "./../Utility"

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

// Plugin component
import styled from "styled-components"

const PluginContainer = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.1);

    justify-content: center;
    align-items: center;
`

const PluginIconWrapper = styled.div`
    flex: 0 0 auto;
    width: 50px;
    height: 50px;
`

const PluginContentsWrapper = styled.div`
    flex: 1 1 auto;

    display: flex;
    flex-direction: column;
`

export const PluginView = (props: { plugin: Plugin }): JSX.Element => {
    return (
        <PluginContainer>
            <PluginIconWrapper />
            <PluginContentsWrapper>
                <div>{props.plugin.id}</div>
                <div style={{ fontSize: "0.8em" }}>v0.1.1</div>
            </PluginContentsWrapper>
        </PluginContainer>
    )
}

//

export class PluginsSidebarPaneView extends React.PureComponent<
    IPluginsSidebarPaneViewProps,
    IPluginsSidebarPaneViewState
> {
    private _subscriptions: IDisposable[] = []

    constructor(props: IPluginsSidebarPaneViewProps) {
        super(props)

        this.state = {
            isActive: false,
            defaultPluginsExpanded: true,
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
                            text={<PluginView plugin={p} />}
                            onClick={noop}
                        />
                    ))

                    const userPluginItems = userPlugins.map(p => (
                        <SidebarItemView
                            indentationLevel={0}
                            isFocused={p.id === selectedId}
                            isContainer={false}
                            text={<PluginView plugin={p} />}
                            onClick={noop}
                        />
                    ))

                    return (
                        <div>
                            <SidebarContainerView
                                text={"Default"}
                                isExpanded={this.state.defaultPluginsExpanded}
                                isFocused={selectedId === "container.default"}
                                onClick={noop}
                            >
                                {defaultPluginItems}
                            </SidebarContainerView>
                            <SidebarContainerView
                                text={"User"}
                                isExpanded={this.state.userPluginsExpanded}
                                isFocused={selectedId === "container.user"}
                                onClick={noop}
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

import * as Oni from "oni-api"

import * as Common from "./../UI/components/common"

export class PluginInformationSection extends React.PureComponent<
    { expanded: boolean; title: string },
    {}
> {
    public render(): JSX.Element {
        return (
            <Common.Section
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    paddingTop: "0.5em",
                    paddingBottom: "0.5em",
                    marginTop: "0.5em",
                    marginBottom: "0.5em",
                    color: "rgb(200, 200, 200)",
                    boxShadow: "0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                }}
            >
                <Common.Container direction={"horizontal"}>
                    <div style={{ padding: "0.25em" }}>
                        <Common.Caret isExpanded={this.props.expanded} />
                    </div>
                    <Common.Subheader>{this.props.title}</Common.Subheader>
                </Common.Container>
                {this.props.expanded ? this.props.children : null}
            </Common.Section>
        )
    }
}

export const PluginCapabilityHeader = (props: { text: string; expanded: boolean }): JSX.Element => {
    return (
        <div style={{ padding: "0.5em" }}>
            <span style={{ fontWeight: "bold" }}>{props.text}</span>
        </div>
    )
}

export interface PluginCapabilityInfoProps {
    icon?: JSX.Element
    text: JSX.Element
    details?: JSX.Element
    backgroundColor?: string
}

export const PluginCapabilityInfo = (props: PluginCapabilityInfoProps) => {
    return (
        <Common.Container
            direction={"horizontal"}
            style={{
                backgroundColor: props.backgroundColor || "rgba(0, 0, 0, 0.1)",
                height: "50px",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "0.5em",
            }}
        >
            <Common.Fixed>{props.icon}</Common.Fixed>
            <Common.Full>{props.text}</Common.Full>
            <Common.Fixed>{props.details}</Common.Fixed>
        </Common.Container>
    )
}

export const Code = (props: { text: string }): JSX.Element => {
    return (
        <div style={{ fontFamily: "Consolas", fontStyle: "italic", padding: "0.5em" }}>
            {props.text}
        </div>
    )
}

export const Description = (props: { text: string }): JSX.Element => {
    return <div style={{ fontSize: "0.8em", padding: "0.5em" }}>{props.text}</div>
}

export const PluginBufferLayerView = (): JSX.Element => {
    return (
        <Common.Container
            direction={"vertical"}
            fullWidth={true}
            fullHeight={true}
            backgroundFromTheme="editor.background"
            style={{ pointerEvents: "all", color: "rgb(200, 200, 200)" }}
        >
            <Common.Section>
                <Common.Container
                    direction={"horizontal"}
                    style={{ justifyContent: "center", alignItems: "center" }}
                >
                    <Common.Fixed style={{ width: "75px", height: "75px" }}>
                        <Common.Center>
                            <div
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    fontSize: "0.7em",
                                }}
                            >
                                icon here
                            </div>
                        </Common.Center>
                    </Common.Fixed>
                    <Common.Full>
                        <Common.Header>oni-plugin-snippets</Common.Header>
                        <Common.Subheader>
                            Plugin that manages Oni's default snippet functionality
                        </Common.Subheader>
                    </Common.Full>
                </Common.Container>
            </Common.Section>
            <Common.Section style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
                Enabled Upgrade
            </Common.Section>
            <PluginInformationSection expanded={false} title={"README"} />
            <PluginInformationSection expanded={true} title={"Capabilities"}>
                <PluginCapabilityHeader text={"Snippets"} expanded={true} />
                <PluginCapabilityHeader text={"Commands"} expanded={true} />
                <PluginCapabilityInfo
                    icon={<Code text={"snippet.next"} />}
                    text={<Description text={"Move snippet to next placeholder"} />}
                />
                <PluginCapabilityInfo
                    icon={<Code text={"snippet.previous"} />}
                    text={<Description text={"Move snippet to previous placeholder"} />}
                />
                <PluginCapabilityInfo
                    icon={<Code text={"snippet.cancel"} />}
                    text={<Description text={"Cancel snippet"} />}
                />
                <PluginCapabilityHeader text={"Configuration"} expanded={true} />
            </PluginInformationSection>
            <PluginInformationSection expanded={true} title={"Performance"}>
                <PluginCapabilityInfo
                    icon={<Code text={"OK"} />}
                    text={<Description text={"Activation took 120s"} />}
                    backgroundColor={"rgba(0, 255, 0, 0.1)"}
                />
                <PluginCapabilityInfo
                    icon={<Code text={"WARNING"} />}
                    text={
                        <Description
                            text={
                                "onCursorMoved events take an average of 150ms, this may impact performance."
                            }
                        />
                    }
                    backgroundColor={"rgba(255, 255, 0, 0.1)"}
                />
            </PluginInformationSection>
            <PluginInformationSection expanded={true} title={"Errors & Warnings"}>
                <PluginCapabilityInfo
                    icon={<Code text={"ERROR"} />}
                    text={<Description text={"Error loading snippets for filetype: `vim`"} />}
                    backgroundColor={"rgba(255, 0, 0, 0.1)"}
                />
            </PluginInformationSection>
        </Common.Container>
    )
}

export class PluginInfoBufferLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.layer.plugin-info"
    }

    public render(): JSX.Element {
        return <PluginBufferLayerView />
    }
}
import { commandManager } from "./../Services/CommandManager"
import { editorManager } from "./../Services/EditorManager"

export const activate = (
    configuration: Configuration,
    pluginManager: PluginManager,
    sidebarManager: SidebarManager,
) => {
    if (configuration.getValue("sidebar.plugins.enabled")) {
        const pane = new PluginsSidebarPane(pluginManager)
        sidebarManager.add("plug", pane)

        commandManager.registerCommand({
            command: "plugin.show",
            name: "show plugin",
            detail: "plugin info",
            execute: () => {
                editorManager.activeEditor.activeBuffer.addLayer(new PluginInfoBufferLayer())
            },
        })
    }
}
