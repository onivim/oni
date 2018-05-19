/**
 * SidebarContentSplit.tsx
 */

import * as React from "react"
import { connect, Provider } from "react-redux"
import styled, { keyframes } from "styled-components"

import { Event, IDisposable, IEvent } from "oni-types"

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
    private _onEnterEvent = new Event<void>()
    private _onLeaveEvent = new Event<void>()

    public get activePane(): SidebarPane {
        const entry = getActiveEntry(this._sidebarManager.store.getState())

        return entry && entry.pane ? entry.pane : null
    }

    constructor(private _sidebarManager: SidebarManager) {}

    public enter(): void {
        const pane: any = this.activePane
        if (pane && pane.enter) {
            pane.enter()
        }

        this._onEnterEvent.dispatch()
    }

    public leave(): void {
        const pane: any = this.activePane
        if (pane && pane.leave) {
            pane.leave()
        }

        this._onLeaveEvent.dispatch()
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._sidebarManager.store}>
                <SidebarContent onEnter={this._onEnterEvent} onLeave={this._onLeaveEvent} />
            </Provider>
        )
    }
}

export interface ISidebarContentViewProps extends ISidebarContentContainerProps {
    activeEntry: ISidebarEntry
    width: string
}

export interface ISidebarContentContainerProps {
    onEnter: IEvent<void>
    onLeave: IEvent<void>
}

export interface ISidebarContentViewState {
    active: boolean
}

const EntranceKeyframes = keyframes`
    0% { opacity: 0.5; transform: translateX(-5px); }
    100%% { opacity: 1; transform: translateX(0px); }
`

export const SidebarContentWrapper = withProps<{}>(styled.div)`
    ${enableMouse}
    width: ${props => props.width};
    color: ${props => props.theme["editor.foreground"]};
    background-color: ${props => props.theme["editor.background"]};
    height: 100%;
    user-select: none;
    cursor: default;

    animation: ${EntranceKeyframes} 0.25s ease-in forwards;

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
            <SidebarHeaderWrapper {...this.props} key={this.props.headerName}>
                <span>{this.props.headerName}</span>
            </SidebarHeaderWrapper>
        )
    }
}

export const SidebarInnerPaneWrapper = withProps<{}>(styled.div)`
    flex: 1 1 auto;
    position: relative;
    height: 100%;
`

export class SidebarContentView extends React.PureComponent<
    ISidebarContentViewProps,
    ISidebarContentViewState
> {
    private _subs: IDisposable[] = []

    constructor(props: ISidebarContentViewProps) {
        super(props)
        this.state = {
            active: false,
        }
    }

    public componentDidMount(): void {
        this._cleanSubscriptions()
        const s1 = this.props.onEnter.subscribe(() =>
            this.setState({
                active: true,
            }),
        )

        const s2 = this.props.onLeave.subscribe(() =>
            this.setState({
                active: false,
            }),
        )

        this._subs = [s1, s2]
    }

    public componentWillUnmount(): void {
        this._cleanSubscriptions()
    }

    public render(): JSX.Element {
        if (!this.props.activeEntry) {
            return null
        }

        const activeEntry = this.props.activeEntry
        const header = activeEntry && activeEntry.pane ? activeEntry.pane.title : null

        return (
            <SidebarContentWrapper className="sidebar-content" width={this.props.width}>
                <SidebarHeaderView hasFocus={this.state.active} headerName={header} />
                <SidebarInnerPaneWrapper key={activeEntry.id}>
                    {activeEntry.pane.render()}
                </SidebarInnerPaneWrapper>
            </SidebarContentWrapper>
        )
    }

    private _cleanSubscriptions(): void {
        this._subs.forEach(s => s.dispose())
        this._subs = []
    }
}

export const mapStateToProps = (
    state: ISidebarState,
    containerProps: ISidebarContentContainerProps,
): ISidebarContentViewProps => {
    const activeEntry = getActiveEntry(state)
    return {
        ...containerProps,
        activeEntry,
        width: state.width,
    }
}

export const SidebarContent = connect(mapStateToProps)(SidebarContentView)
