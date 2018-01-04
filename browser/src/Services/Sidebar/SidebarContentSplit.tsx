/**
 * SidebarContentSplit.tsx
 */

import * as React from "react"
import { Provider } from "react-redux"

import { Event, IEvent } from "oni-types"

import styled from "styled-components"
import {enableMouse, withProps} from "./../../UI/components/common"

import { SidebarManager, ISidebarEntry } from "./SidebarStore"

/**
 * Split that is the container for the active sidebar item
 */
export class SidebarContentSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    constructor(
        private _sidebarManager: SidebarManager = new SidebarManager()
    ) {
        // this._sidebarManager.onSidebarChanged.subscribe(() => {
        //     console.log("changed")
        // })
    }

    public enter(): void {
        this._onEnterEvent.dispatch()

    }

    public leave(): void {

    }

    public render(): JSX.Element {
        return <Provider store={this._sidebarManager.store}>
                <SidebarContentView />
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

export class SidebarContentView extends React.PureComponent<{}, {}> {
    public render(): JSX.Element {
        return <SidebarContentWrapper>
                    <SidebarHeaderView hasFocus={true} headerName={"test"} />
            </SidebarContentWrapper>
    }
}
