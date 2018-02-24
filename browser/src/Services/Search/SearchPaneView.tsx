/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import * as React from "react"

import { IDisposable, IEvent } from "oni-types"

import { Workspace } from "./../Workspace"

export * from "./SearchProvider"

import { ISearchOptions } from "./SearchProvider"

import styled from "styled-components"
import { SearchTextBox } from "./SearchTextBox"

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

const Label = styled.div`
    margin: 8px;
`

export interface ISearchPaneViewProps {
    workspace: Workspace
    onEnter: IEvent<void>
    onLeave: IEvent<void>
    onFocus: IEvent<void>
    focusImmediately?: boolean

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
            searchQuery: "Search...",
            fileFilter: null,
        }
    }

    public componentDidMount(): void {
        this._cleanExistingSubscriptions()

        const s1 = this.props.onEnter.subscribe(() => this.setState({ isActive: true }))
        const s2 = this.props.onLeave.subscribe(() => this.setState({ isActive: false }))
        const s3 = this.props.workspace.onDirectoryChanged.subscribe((wd: string) =>
            this.setState({ activeWorkspace: wd }),
        )

        const s4 = this.props.onFocus.subscribe(() =>
            this.setState({ activeTextbox: "textbox.query" }),
        )

        this._subscriptions = [s1, s2, s3, s4]

        if (this.props.focusImmediately) {
            this.setState({
                activeTextbox: "textbox.query",
            })
        }
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
                ids={["textbox.query" /*, "textbox.filter"*/]}
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
                                onClick={() => this._onSelected("textbox.query")}
                            />
                            {/*<Label>Filter</Label>
                            <SearchTextBox
                                val={this.state.fileFilter}
                                onChangeText={val => this._onChangeFilesFilter(val)}
                                onCommit={() => this._clearActiveTextbox()}
                                onDismiss={() => this._clearActiveTextbox()}
                                isFocused={selectedId === "textbox.filter"}
                                isActive={this.state.activeTextbox === "textbox.filter"}
                            />*/}
                        </div>
                    )
                }}
            />
        )
    }

    // private _onChangeFilesFilter(val: string): void {
    //     this.setState({
    //         fileFilter: val,
    //     })

    //     this._startSearch()
    // }

    private _onChangeSearchQuery(val: string): void {
        this.setState({
            searchQuery: val,
        })

        this._startSearch(val)
    }

    // private _onCommit(): void {

    // }

    private _clearActiveTextbox(): void {
        this.setState({ activeTextbox: null })
    }

    private _onSelected(selectedId: string): void {
        if (selectedId === "textbox.query") {
            this.setState({ activeTextbox: "textbox.query" })
        } else if (selectedId === "textbox.filter") {
            this.setState({ activeTextbox: "textbox.filter" })
        }
    }

    private _startSearch(val: string): void {
        this.props.onSearchOptionsChanged({
            searchQuery: val,
            fileFilter: this.state.fileFilter,
            workspace: this.props.workspace.activeWorkspace,
        })
    }
}
