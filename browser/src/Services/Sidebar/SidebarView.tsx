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

export interface ISidebarIconProps {
    active: boolean
    iconName: string
    borderColor: string
    backgroundColor: string
}

export class SidebarIcon extends React.PureComponent<ISidebarIconProps, {}> {
    public render(): JSX.Element {

        const className = "sidebar-icon-container" + (this.props.active ? " active" : " inactive")

        const containerStyle = {
            border: "1px solid " + this.props.borderColor,
            backgroundColor: this.props.backgroundColor,
        }

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
    activeColor: string
    borderColor: string
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

        const icons = this.props.entries.map((e) => {
            const isActive = e.id === this.props.activeEntryId
            const isFocused = e.id === this.props.focusedEntryId
            return <SidebarIcon
                        key={e.id}
                        iconName={e.icon}
                        active={isActive}
                        borderColor={isFocused ? this.props.borderColor : "transparent"}
                        backgroundColor={isActive ? this.props.activeColor : "transparent"}
                    />
        })

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
        backgroundColor: state.backgroundColor,
        foregroundColor: state.foregroundColor,
        activeColor: state.activeColor,
        borderColor: state.borderColor,
        width: "50px",
    }
}

export const Sidebar = connect(mapStateToProps)(SidebarView)
