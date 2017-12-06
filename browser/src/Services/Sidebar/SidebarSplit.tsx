/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import { connect, Provider } from "react-redux"

import { Store, Reducer } from "redux"
import { createStore as createReduxStore } from "./../../Redux"

import { Event, IEvent } from "oni-types"

import { Icon, IconSize } from "./../../UI/Icon"

import { KeyboardInputView } from "./../../Editor/KeyboardInput"

require("./Sidebar.less") // tslint:disable-line


export interface ISidebarEntry {
    id: string
    icon: string
    enabled: boolean
}

export interface ISidebarState {
    icons: ISidebarEntry[]

    // Active means that the tab is currently selected
    activeEntryId: string

    // Focused means that there is keyboard focus,
    // like 'hover' but for keyboard accessibility
    focusedEntryId: string
}

const DefaultSidebarState: ISidebarState = {
    icons: [
        { id: "sidebar.explorer", icon: "files-o", enabled: true },
        { id: "sidebar.search", icon: "search", enabled: true },
        { id: "sidebar.tutor", icon: "graduation-cap", enabled: true },
        { id: "sidebar.vcs", icon: "code-fork", enabled: true, },
        { id: "sidebar.debugger", icon: "bug", enabled: true },
        { id: "sidebar.packages", icon: "th", enabled: true },
    ],
    activeEntryId: "sidebar.explorer",
    focusedEntryId: "sidebar.explorer",
}

export type SidebarActions = {
    type: "SET_ACTIVE_ID",
    activeEntryId: string
} | {
    type: "SET_FOCUSED_ID",
    focusedEntryId: string
}

export const sidebarReducer: Reducer<ISidebarState> = (
    state: ISidebarState = DefaultSidebarState,
    action: SidebarActions
) => {
    switch (action.type) {
        case "SET_ACTIVE_ID":
            return {
                ...state,
                activeEntryId: action.activeEntryId,
            }
        case "SET_FOCUSED_ID":
            return {
                ...state,
                focusedEntryId: action.focusedEntryId,
            }
        default:
            return state
    }
}

const createStore = (): Store<ISidebarState> => {
    return createReduxStore("Sidebar", sidebarReducer, DefaultSidebarState)
}

export interface ISidebarIconProps {
    active: boolean
    iconName: string
    focused: boolean
}

export class SidebarIcon extends React.PureComponent<ISidebarIconProps, {}> {
    public render(): JSX.Element {

        const className = "sidebar-icon-container" + (this.props.active ? " active" : " inactive")

        const focusedContainerStyle = {
            border: "1px solid white"
        }
        
        const containerStyle = this.props.focused ? focusedContainerStyle : null

        return <div className={className} tabIndex={0} style={containerStyle}>
                    <div className="sidebar-icon">
                        <Icon name={this.props.iconName} size={IconSize.Large} />
                    </div>
                </div>
    }
}

export interface ISidebarViewProps extends ISidebarContainerProps {
    backgroundColor: string
    foregroundColor: string
    width: string
    visible: boolean
    entries: ISidebarEntry[]
    activeEntryId: string
    focusedEntryId: string
}

export interface ISidebarContainerProps {
    onEnter: IEvent<void>
    onKeyDown: (key: string) => void
}

export class SidebarView extends React.PureComponent<ISidebarViewProps, {}> {
    public render(): JSX.Element {
        const style: React.CSSProperties = {
            color: this.props.foregroundColor,
            backgroundColor: this.props.backgroundColor,
            width: this.props.width,
        }

        if (!this.props.visible) {
            return null
        }

        const icons = this.props.entries.map((e) => <SidebarIcon iconName={e.icon} active={e.id === this.props.activeEntryId} focused={e.id === this.props.focusedEntryId} />)

        return <div className="sidebar enable-mouse" style={style}>
                <div className="icons">
                    {icons}
                </div>
                <div className="input">
                    <KeyboardInputView
                        top={0}
        left={0}
        height={12}
        onActivate={this.props.onEnter}
        onKeyDown={this.props.onKeyDown}
        foregroundColor={"white"}
        fontFamily={"Segoe UI"}
        fontSize={"12px"}
        fontCharacterWidthInPixels={12}

                        />
                </div>
            </div>

    }
}

export const mapStateToProps = (state: ISidebarState, containerProps: ISidebarContainerProps): ISidebarViewProps => {
    return {
        ...containerProps,
        entries: state.icons,
        activeEntryId: state.activeEntryId,
        focusedEntryId: state.focusedEntryId,
        visible: true,
        backgroundColor: "black",
        foregroundColor: "white",
        width: "50px",
    }
}

const Sidebar = connect(mapStateToProps)(SidebarView)

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

export class SidebarSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    private _activeBinding: IMenuBinding = null
    private _store: Store<ISidebarState>

    constructor() {
        this._store = createStore()
    }

    public enter(): void {
        this._onEnterEvent.dispatch()

        const state = this._store.getState()
        this._store.dispatch({
            type: "SET_FOCUSED_ID",
            focusedEntryId: state.activeEntryId,
        })

        this._activeBinding = getInstance().bindToMenu()
    }

    public leave(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }

        this._store.dispatch({
            type: "SET_FOCUSED_ID",
            focusedEntryId: null,
        })
    }

    public render(): JSX.Element {
        return <Provider store={this._store}>
                <Sidebar onKeyDown={(key) => this._onKeyDown(key)} onEnter={this._onEnterEvent}/>
            </Provider>
    }

    private _onKeyDown(key: string): void {
        console.log("key down!")

        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}
