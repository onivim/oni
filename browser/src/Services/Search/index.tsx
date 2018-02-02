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
import { OniButton, SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

import { withProps, boxShadow } from "./../../UI/components/common"

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
            activeWorkspace: this.props.workspace.activeWorkspace,
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
                    onClickButton={() => this.props.workspace.openFolder()}
                />
            )
        }

        return (
            <VimNavigator
                active={this.state.isActive}
                ids={["textbox.query", "textbox.filter", "button.search"]}
                render={() => {
                    return (
                        <div>
                            <Label>Query</Label>
                            <SearchTextBox isFocused={true} isActive={false} />
                            <Label>Filter</Label>
                            <SearchTextBox isFocused={true} isActive={false} />
                            <OniButton
                                focused={false}
                                text={"Search"}
                                onClick={() => this._startSearch()}
                            />
                        </div>
                    )
                }}
            />
        )
    }

    private _startSearch(): void {
        alert("searching!")
    }
}

export interface ISearchTextBoxProps {
    isActive: boolean
    isFocused: boolean
}

const SearchBoxContainerWrapper = withProps<ISearchTextBoxProps>(styled.div)`
    margin: 8px;

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
        const inner = this.props.isActive ? <TextInputView /> : <div style={{ opacity: 0 }}>a</div>
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
