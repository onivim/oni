/**
 * SidebarView.tsx
 *
 * View component for the sidebar
 */

import * as React from "react"
import { connect } from "react-redux"

import { Icon, IconSize } from "./../../UI/Icon"

import { ISidebarEntry, ISidebarState } from "./SidebarStore"

import styled, { keyframes } from "styled-components"
import { withProps } from "./../../UI/components/common"

import { Sneakable } from "./../../UI/components/Sneakable"

export interface ISidebarIconProps {
    id: string
    active: boolean
    focused: boolean
    iconName: string
    hasNotification: boolean
    onClick: () => void
}

import { VimNavigator } from "./../../UI/components/VimNavigator"

const EntranceKeyframes = keyframes`
    0% { opacity: 0.5; transform: scale(0.5) translateX(-10px); }
    100%% { opacity: 1; transform: scale(1.0) translateX(0px); }
`

const SidebarIconWrapper = withProps<ISidebarIconProps>(styled.div)`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.5;
    outline: none;
    cursor: pointer;
    opacity: ${props => (props.active ? 0.9 : 0.75)};
    border-left: 2px solid ${props =>
        props.focused ? props.theme["sidebar.selection.border"] : "transparent"};
    background-color: ${props =>
        props.active ? props.theme["editor.background"] : props.theme.background};
    transition: transform 0.2s ease-in;
    transform: ${props => (props.active || props.focused ? "translateY(0px)" : "translateY(0px)")};

    animation: ${EntranceKeyframes} 0.1s ease-in forwards;

    &.active {
        opacity: 0.75;
    }

    &:hover {
        transform: translateY(0px);
        opacity: 0.9;
    }
    `

const NotificationEnterKeyFrames = keyframes`
    0% { opacity: 0; transform: scale(0.5); translateY(6px); }
    75% { opacity: 0.75; transform: scale(1.25); translateY(2px); }
    100% { opacity: 1; transform: scale(1); translateY(0px); }
`

const SidebarIconNotification = withProps<{}>(styled.div)`
    animation: ${NotificationEnterKeyFrames} 0.35s linear forwards;
    animation-delay: 1s;

    opacity: 0;

    position:absolute;
    top: 10px;
    right: 10px;
    width: 0.4rem;
    height: 0.4rem;

    background-color: ${p => p.theme["highlight.mode.normal.background"]};
    border-radius: 1rem;
`

const SidebarIconInner = styled.div`
    margin-top: 16px;
    margin-bottom: 16px;
`

export class SidebarIcon extends React.PureComponent<ISidebarIconProps, {}> {
    public render(): JSX.Element {
        const notification = this.props.hasNotification ? <SidebarIconNotification /> : null
        return (
            <Sneakable callback={this.props.onClick} tag={this.props.id}>
                <SidebarIconWrapper {...this.props} tabIndex={0}>
                    <SidebarIconInner>
                        <Icon name={this.props.iconName} size={IconSize.Large} />
                    </SidebarIconInner>
                    {notification}
                </SidebarIconWrapper>
            </Sneakable>
        )
    }
}

export interface ISidebarViewProps extends ISidebarContainerProps {
    width: string
    visible: boolean
    entries: ISidebarEntry[]
    activeEntryId: string
    isActive: boolean
}

export interface ISidebarContainerProps {
    onSelectionChanged: (selectedId: string) => void
}

export interface ISidebarWrapperProps {
    width: string
    isActive: boolean
}

const SidebarWrapper = withProps<ISidebarWrapperProps>(styled.div)`
    pointer-events: auto;

    display: flex;
    flex-direction: column;

    border-top: ${props =>
        props.isActive
            ? "2px solid " + props.theme["highlight.mode.normal.background"]
            : "2px solid " + props.theme["editor.background"]};

    color: ${props => props.theme["sidebar.foreground"]};
    width: ${props => props.width};
`

export class SidebarView extends React.PureComponent<ISidebarViewProps, {}> {
    public render(): JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const ids = this.props.entries.map(e => e.id)

        return (
            <SidebarWrapper width={this.props.width} isActive={this.props.isActive}>
                <VimNavigator
                    ids={ids}
                    active={this.props.isActive}
                    onSelectionChanged={val => this.props.onSelectionChanged(val)}
                    render={(selectedId: string): JSX.Element => {
                        const items = this.props.entries.map(e => {
                            const isActive = e.id === this.props.activeEntryId
                            const isFocused = e.id === selectedId && this.props.isActive
                            return (
                                <SidebarIcon
                                    id={e.id}
                                    key={e.id}
                                    iconName={e.icon}
                                    active={isActive}
                                    focused={isFocused}
                                    hasNotification={e.hasNotification}
                                    onClick={() => this.props.onSelectionChanged(e.id)}
                                />
                            )
                        })
                        return <div className="icons">{items}</div>
                    }}
                />
            </SidebarWrapper>
        )
    }
}

export const mapStateToProps = (
    state: ISidebarState,
    containerProps: ISidebarContainerProps,
): ISidebarViewProps => {
    return {
        ...containerProps,
        entries: state.entries,
        activeEntryId: state.activeEntryId,
        isActive: state.isActive,
        visible: true,
        width: "50px",
    }
}

export const Sidebar = connect(mapStateToProps)(SidebarView)
