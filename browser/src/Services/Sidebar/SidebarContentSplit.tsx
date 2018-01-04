/**
 * SidebarContentSplit.tsx
 */

import * as React from "react"
import { connect, Provider } from "react-redux"

import { Event, IEvent } from "oni-types"

import styled from "styled-components"
import {enableMouse, withProps} from "./../../UI/components/common"

import { SidebarManager, ISidebarEntry, ISidebarState } from "./SidebarStore"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

/**
 * Split that is the container for the active sidebar item
 */
export class SidebarContentSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    private _activeBinding: IMenuBinding = null

    constructor(
        private _sidebarManager: SidebarManager = new SidebarManager()
    ) {
        // this._sidebarManager.onSidebarChanged.subscribe(() => {
        //     console.log("changed")
        // })
    }

    public enter(): void {
        this._onEnterEvent.dispatch()

        this._activeBinding = getInstance().bindToMenu()

    }

    public leave(): void {

        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }

    }

    public render(): JSX.Element {
        return <Provider store={this._sidebarManager.store}>
                <SidebarContent onEnter={null} onKeyDown={() => {}}/>
            </Provider>
    }

    // private _onKeyDown(key: string): void {
    //     // if (this._activeBinding) {
    //     //     this._activeBinding.input(key)
    //     // }
    // }
}

export interface ISidebarContentContainerProps {
    onEnter: IEvent<void>
    onKeyDown: (key: string) => void
}

export interface ISidebarContentViewProps extends ISidebarContentContainerProps {
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
    border-top: ${props => props.hasFocus ? "2px solid " + props.theme["highlight.mode.normal.background"] : "2px solid transparent"};

    flex: 0 0 auto;
`

export class SidebarHeaderView extends React.PureComponent<ISidebarHeaderProps, {}> {
    public render(): JSX.Element {
        return <SidebarHeaderWrapper {...this.props}>
                <span>{this.props.headerName}</span>
            </SidebarHeaderWrapper>
    }
}

export class SidebarContentView extends React.PureComponent<ISidebarContentViewProps, {}> {
    public render(): JSX.Element {

        if (!this.props.activeEntry) {
            return null
        }

        const activeEntry = this.props.activeEntry
        const header = activeEntry && activeEntry.pane ? activeEntry.pane.title : null

        return <SidebarContentWrapper>
                    <SidebarHeaderView hasFocus={true} headerName={header} />
            </SidebarContentWrapper>
    }
}

export const mapStateToProps = (state: ISidebarState, containerProps: ISidebarContentContainerProps): ISidebarContentViewProps => {
    const filteredEntries = state.entries.filter((entry) => entry.id === state.activeEntryId)

    const activeEntry = filteredEntries.length > 0 ? filteredEntries[0] : null

    return {
        ...containerProps,
        activeEntry: activeEntry,
    }
}

export const SidebarContent = connect(mapStateToProps)(SidebarContentView)
