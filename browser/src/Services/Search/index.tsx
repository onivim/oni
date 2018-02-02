/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { SidebarManager } from "./../Sidebar"
import { Workspace } from "./../Workspace"

export * from "./SearchProvider"

import { ISearchProvider, ISearchOptions, RipGrepSearchProvider } from "./SearchProvider"

export class SearchPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    private _searchProvider: ISearchProvider

    public get id(): string {
        return "oni.sidebar.search"
    }

    public get title(): string {
        return "Search"
    }

    constructor(private _workspace: Workspace) {
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

        this._searchProvider.search(searchOpts)
    }
}

import styled from "styled-components"

import { TextInputView } from "./../../UI/components/LightweightText"
import { OniButton, SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

import { withProps, boxShadow } from "./../../UI/components/common"

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
            searchQuery: null,
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
                active={this.state.isActive}
                ids={["textbox.query", "textbox.filter", "button.search"]}
                onSelected={(selectedId: string) => {
                    this._onSelected(selectedId)
                }}
                render={(selectedId: string) => {
                    return (
                        <div>
                            <Label>Query</Label>
                            <SearchTextBox
                                onCommit={() => this._clearActiveTextbox()}
                                onDismiss={() => this._clearActiveTextbox()}
                                isFocused={selectedId === "textbox.query"}
                                isActive={this.state.activeTextbox === "textbox.query"}
                            />
                            <Label>Filter</Label>
                            <SearchTextBox
                                onCommit={() => this._clearActiveTextbox()}
                                onDismiss={() => this._clearActiveTextbox()}
                                isFocused={selectedId === "textbox.filter"}
                                isActive={this.state.activeTextbox === "textbox.filter"}
                            />

                            <div style={{ marginTop: "8px" }}>
                                <OniButton
                                    focused={selectedId === "button.search"}
                                    text={"Search"}
                                    onClick={() => this._startSearch()}
                                />
                            </div>
                        </div>
                    )
                }}
            />
        )
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

export interface ISearchTextBoxProps {
    isActive: boolean
    isFocused: boolean
    val: string

    onDismiss: () => void
    onCommit: (newValue: string) => void
    onChange: (newValue: string) => void
}

const SearchBoxContainerWrapper = withProps<ISearchTextBoxProps>(styled.div)`
    padding: 8px;

    background-color: ${props => (props.isFocused ? "rgba(0, 0, 0, 0.1)" : "transparent")};
    border-left: 2px solid ${props =>
        props.isFocused ? props.theme["highlight.mode.normal.background"] : "transparent"};
`

const SearchTextBoxWrapper = withProps<ISearchTextBoxProps>(styled.div)`
    padding: 8px;
    border: ${props =>
        props.isActive
            ? "2px solid " + props.theme["highlight.mode.normal.background"]
            : "1px solid " + props.theme["editor.foreground"]};
    margin: 8px;
    background-color: ${props => props.theme["background"]};

    ${props => (props.isActive ? boxShadow : "")};

    transition: all 0.1s ease-in;

    input {
        background-color: transparent;
        color: ${props => props.theme["editor.foreground"]}
    }
`

export class SearchTextBox extends React.PureComponent<ISearchTextBoxProps, {}> {
    public render(): JSX.Element {
        const inner = this.props.isActive ? (
            <TextInputView
                defaultValue={this.props.val}
                onCancel={this.props.onDismiss}
                onChange={this.props.onChange}
                onComplete={this.props.onCommit}
            />
        ) : (
            <div>{this.props.val}</div>
        )
        return (
            <SearchBoxContainerWrapper {...this.props}>
                <SearchTextBoxWrapper {...this.props}>{inner}</SearchTextBoxWrapper>
            </SearchBoxContainerWrapper>
        )
    }
}

export const activate = (sidebarManager: SidebarManager, workspace: Workspace) => {
    sidebarManager.add("search", new SearchPane(workspace))
}
