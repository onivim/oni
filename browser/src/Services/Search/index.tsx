/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import * as React from "react"

import { SidebarManager } from "./../Sidebar"

export class SearchPane {
    public get id(): string {
        return "oni.sidebar.search"
    }

    public get title(): string {
        return "Search"
    }

    public enter(): void {
        console.log("entering pane")
    }

    public leave(): void {
        console.log("leaving pane")
    }

    public render(): JSX.Element {
        return <SearchPaneView />
    }
}

import styled from "styled-components"

import { TextInputView } from "./../../UI/components/LightweightText"

const Label = styled.div`
    margin-left: 8px;
`

export class SearchPaneView extends React.PureComponent<{}, {}> {
    public render(): JSX.Element {
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

export const activate = (sidebarManager: SidebarManager) => {
    sidebarManager.add("search", new SearchPane())
}
