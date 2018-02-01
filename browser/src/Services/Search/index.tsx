/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { SidebarManager } from "./../Sidebar"
import { Workspace } from "./../Workspace"

export class SearchPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    public get id(): string {
        return "oni.sidebar.search"
    }

    public get title(): string {
        return "Search"
    }

    constructor(private _workspace: Workspace) {}

    public enter(): void {
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    public render(): JSX.Element {
        return (
            <SearchPaneView
                workspace={this._workspace}
                onEnter={this._onEnter}
                onLeave={this._onLeave}
            />
        )
    }
}

import styled from "styled-components"

import { TextInputView } from "./../../UI/components/LightweightText"
import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"

const Label = styled.div`
    margin-left: 8px;
`

export interface ISearchPaneViewProps {
    workspace: Workspace
    onEnter: IEvent<void>
    onLeave: IEvent<void>
}

export interface ISearchPaneViewState {
    activeWorkspace: string
    isActive: boolean
}

export class SearchPaneView extends React.PureComponent<
    ISearchPaneViewProps,
    ISearchPaneViewState
> {
    private _subscriptions: IDisposable[] = []

    constructor(props: ISearchPaneViewProps) {
        super(props)

        this.state = {
            activeWorkspace: null,
            isActive: false,
        }
    }

    public componentDidMount(): void {
        this._cleanExistingSubscriptions()

        const s1 = this.props.onEnter.subscribe(() => this.setState({ isActive: true }))
        const s2 = this.props.onLeave.subscribe(() => this.setState({ isActive: false }))
        const s3 = this.props.workspace.onDirectoryChanged.subscribe((wd: string) =>
            this.setState({ activeWorkspace: wd }),
        )

        this._subscriptions = [s1, s2, s3]
    }

    public componentWillUnmount(): void {
        this._cleanExistingSubscriptions()
    }

    private _cleanExistingSubscriptions(): void {
        this._subscriptions.forEach(s => s.dispose())
        this._subscriptions = []
    }

    public render(): JSX.Element {
        if (!this.state.activeWorkspace) {
            return (
                <SidebarEmptyPaneView
                    active={this.state.isActive}
                    contentsText="Nothing to search, yet!"
                    actionButtonText={"Open Folder"}
                />
            )
        }

        return (
            <div>
                <Label>Query</Label>
                <SearchTextBox isActive={true} />
                <Label>Filter</Label>
                <SearchTextBox isActive={false} />
            </div>
        )
    }
}

export interface ISearchTextBoxProps {
    isActive: boolean
}

export class SearchTextBox extends React.PureComponent<ISearchTextBoxProps, {}> {
    public render(): JSX.Element {
        const inner = this.props.isActive ? (
            <TextInputView backgroundColor="black" foregroundColor="white" />
        ) : (
            <div>text</div>
        )
        return <div>{inner}</div>
    }
}

export const activate = (sidebarManager: SidebarManager, workspace: Workspace) => {
    sidebarManager.add("search", new SearchPane(workspace))
}
