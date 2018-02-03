/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { EditorManager } from "./../EditorManager"
import { SidebarManager } from "./../Sidebar"
import { Workspace } from "./../Workspace"

export * from "./SearchProvider"

import {
    ISearchProvider,
    ISearchOptions,
    ISearchQuery,
    RipGrepSearchProvider,
    QuickFixSearchResultsViewer,
} from "./SearchProvider"

import { SearchTextBox } from "./SearchTextBox"

export class SearchPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    private _searchProvider: ISearchProvider
    private _currentQuery: ISearchQuery

    public get id(): string {
        return "oni.sidebar.search"
    }

    public get title(): string {
        return "Search"
    }

    constructor(private _editorManager: EditorManager, private _workspace: Workspace) {
        this._searchProvider = new RipGrepSearchProvider()
    }

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
                onSearchOptionsChanged={opts => this._onSearchOptionsChanged(opts)}
            />
        )
    }

    private _onSearchOptionsChanged(searchOpts: ISearchOptions): void {
        console.log("changed: " + searchOpts)

        if (this._currentQuery) {
            this._currentQuery.cancel()
        }

        const query = this._searchProvider.search(searchOpts)

        query.start()

        query.onSearchCompleted.subscribe(result => {
            const visualizer = new QuickFixSearchResultsViewer(this._editorManager)
            visualizer.showResult(result)
        })

        this._currentQuery = query
    }
}

import styled from "styled-components"

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

const Label = styled.div`
    margin: 8px;
`

export interface ISearchPaneViewProps {
    workspace: Workspace
    onEnter: IEvent<void>
    onLeave: IEvent<void>

    onSearchOptionsChanged: (opts: ISearchOptions) => void
}

export interface ISearchPaneViewState {
    activeWorkspace: string
    isActive: boolean
    activeTextbox: string

    searchQuery: string
    fileFilter: string
}

export class SearchPaneView extends React.PureComponent<
    ISearchPaneViewProps,
    ISearchPaneViewState
> {
    private _subscriptions: IDisposable[] = []

    constructor(props: ISearchPaneViewProps) {
        super(props)

        this.state = {
            activeWorkspace: this.props.workspace.activeWorkspace,
            isActive: false,
            activeTextbox: null,
            searchQuery: "Type to search...",
            fileFilter: "*.*",
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
                    onClickButton={() => this.props.workspace.openFolder()}
                />
            )
        }

        return (
            <VimNavigator
                active={this.state.isActive && !this.state.activeTextbox}
                ids={["textbox.query", "textbox.filter"]}
                onSelected={(selectedId: string) => {
                    this._onSelected(selectedId)
                }}
                render={(selectedId: string) => {
                    return (
                        <div>
                            <Label>Query</Label>
                            <SearchTextBox
                                val={this.state.searchQuery}
                                onChangeText={val => this._onChangeSearchQuery(val)}
                                onCommit={() => this._clearActiveTextbox()}
                                onDismiss={() => this._clearActiveTextbox()}
                                isFocused={selectedId === "textbox.query"}
                                isActive={this.state.activeTextbox === "textbox.query"}
                            />
                            <Label>Filter</Label>
                            <SearchTextBox
                                val={this.state.fileFilter}
                                onChangeText={val => this._onChangeFilesFilter(val)}
                                onCommit={() => this._clearActiveTextbox()}
                                onDismiss={() => this._clearActiveTextbox()}
                                isFocused={selectedId === "textbox.filter"}
                                isActive={this.state.activeTextbox === "textbox.filter"}
                            />
                        </div>
                    )
                }}
            />
        )
    }

    private _onChangeFilesFilter(val: string): void {
        this.setState({
            fileFilter: val,
        })

        this._startSearch()
    }

    private _onChangeSearchQuery(val: string): void {
        this.setState({
            searchQuery: val,
        })

        this._startSearch()
    }

    // private _onCommit(): void {

    // }

    private _clearActiveTextbox(): void {
        this.setState({ activeTextbox: null })
    }

    private _onSelected(selectedId: string): void {
        if (selectedId === "button.search") {
            this._startSearch()
        } else if (selectedId === "textbox.query") {
            this.setState({ activeTextbox: "textbox.query" })
        } else if (selectedId === "textbox.filter") {
            this.setState({ activeTextbox: "textbox.filter" })
        }
    }

    private _startSearch(): void {
        this.props.onSearchOptionsChanged({
            searchQuery: this.state.searchQuery,
            fileFilter: this.state.fileFilter,
            workspace: this.props.workspace.activeWorkspace,
        })
    }
}

export const activate = (
    editorManager: EditorManager,
    sidebarManager: SidebarManager,
    workspace: Workspace,
) => {
    sidebarManager.add("search", new SearchPane(editorManager, workspace))
}
