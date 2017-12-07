/**
 * SidebarView.tsx
 *
 * View component for the sidebar
 */

import * as React from "react"
import { connect } from "react-redux"

import { IEvent } from "oni-types"

import { KeyboardInputView } from "./../../Editor/KeyboardInput"
import { Icon, IconSize } from "./../../UI/Icon"

import { ISidebarEntry, ISidebarState } from "./SidebarStore"

require("./Sidebar.less") // tslint:disable-line

export interface ISidebarIconProps {
    active: boolean
    iconName: string
    focused: boolean
}

const UnfocusedContainerStyle = {
    border: "1px solid transparent",
}

export class SidebarIcon extends React.PureComponent<ISidebarIconProps, {}> {
    public render(): JSX.Element {

        const className = "sidebar-icon-container" + (this.props.active ? " active" : " inactive")

        const focusedContainerStyle = {
            border: "1px solid white",
        }

        const containerStyle = this.props.focused ? focusedContainerStyle : UnfocusedContainerStyle

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

export const Sidebar = connect(mapStateToProps)(SidebarView)
