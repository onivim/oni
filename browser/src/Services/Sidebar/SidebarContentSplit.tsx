/**
 * SidebarContentSplit.tsx
 */

import * as React from "react"
import { connect, Provider } from "react-redux"

import styled from "styled-components"
import { enableMouse, withProps } from "./../../UI/components/common"

import { ISidebarEntry, ISidebarState, SidebarManager, SidebarPane } from "./SidebarStore"

export const getActiveEntry = (state: ISidebarState): ISidebarEntry => {
    const filteredEntries = state.entries.filter(entry => entry.id === state.activeEntryId)

    const activeEntry = filteredEntries.length > 0 ? filteredEntries[0] : null

    return activeEntry
}

/**
 * Split that is the container for the active sidebar item
 */
export class SidebarContentSplit {
    public get activePane(): SidebarPane {
        const entry = getActiveEntry(this._sidebarManager.store.getState())

        return entry && entry.pane ? entry.pane : null
    }

    constructor(private _sidebarManager: SidebarManager = new SidebarManager()) {}

    public enter(): void {
        const pane: any = this.activePane
        if (pane && pane.enter) {
            pane.enter()
        }
    }

    public leave(): void {
        const pane: any = this.activePane
        if (pane && pane.leave) {
            pane.leave()
        }
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._sidebarManager.store}>
                <SidebarContent />
            </Provider>
        )
    }
}

export interface ISidebarContentViewProps {
    activeEntry: ISidebarEntry
}

export const SidebarContentWrapper = withProps<{}>(styled.div)`
    ${enableMouse}
    width: 200px;
    color: ${props => props.theme["editor.foreground"]};
    background-color: ${props => props.theme["editor.background"]};
    height: 100%;
    user-select: none;
    cursor: default;

    display: flex;
    flex-direction: column;
`

export interface ISidebarHeaderProps {
    // True if the pane has focus, false otherwise
    hasFocus: boolean

    headerName: string
}

export const SidebarHeaderWrapper = withProps<ISidebarHeaderProps>(styled.div)`
    height: 2.5em;
    line-height: 2.5em;
    text-align: center;
    border-top: ${props =>
        props.hasFocus
            ? "2px solid " + props.theme["highlight.mode.normal.background"]
            : "2px solid transparent"};

    flex: 0 0 auto;
`

export class SidebarHeaderView extends React.PureComponent<ISidebarHeaderProps, {}> {
    public render(): JSX.Element {
        return (
            <SidebarHeaderWrapper {...this.props}>
                <span>{this.props.headerName}</span>
            </SidebarHeaderWrapper>
        )
    }
}

export const SidebarInnerPaneWrapper = withProps<{}>(styled.div)`
    flex: 1 1 auto;
    overflow-y: auto;
`

export class SidebarContentView extends React.PureComponent<ISidebarContentViewProps, {}> {
    public render(): JSX.Element {
        if (!this.props.activeEntry) {
            return null
        }

        const activeEntry = this.props.activeEntry
        const header = activeEntry && activeEntry.pane ? activeEntry.pane.title : null

        return (
            <SidebarContentWrapper key={activeEntry.id}>
                <SidebarHeaderView hasFocus={true} headerName={header} />
                <SidebarInnerPaneWrapper>{activeEntry.pane.render()}</SidebarInnerPaneWrapper>
            </SidebarContentWrapper>
        )
    }
}

export const mapStateToProps = (state: ISidebarState): ISidebarContentViewProps => {
    const activeEntry = getActiveEntry(state)
    return {
        activeEntry,
    }
}

export const SidebarContent = connect(mapStateToProps)(SidebarContentView)
