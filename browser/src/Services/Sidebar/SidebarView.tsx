/**
 * SidebarView.tsx
 *
 * View component for the sidebar
 */

import * as React from "react"
import { connect } from "react-redux"

import { IEvent } from "oni-types"

import { KeyboardInputView } from "./../../Input/KeyboardInput"
import { Icon, IconSize } from "./../../UI/Icon"

import { ISidebarEntry, ISidebarState } from "./SidebarStore"

import styled from "styled-components"
import { withProps } from "./../../UI/components/common"

export interface ISidebarIconProps {
    active: boolean
    focused: boolean
    iconName: string
}

const SidebarIconWrapper = withProps<ISidebarIconProps>(styled.div)`
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.5;
    outline: none;
    cursor: ${props => props.active ? "pointer" : null};
    opacity: ${props => props.active ? 0.9 : 0.75};
    border: 1px solid ${props => props.focused ? props.theme["sidebar.selection.border"] : "transparent"};
    background-color: ${ props => props.active ? props.theme["sidebar.active.background"] : "transparent"};

    &.active {
        cursor: pointer;
        opacity: 0.75;
    }

    &:hover {
        transform: translateY(1px);
        opacity: 0.9;
    }
    `

const SidebarIconInner = styled.div`
    margin-top: 16px;
    margin-bottom: 16px;
`

export class SidebarIcon extends React.PureComponent<ISidebarIconProps, {}> {
    public render(): JSX.Element {

        return <SidebarIconWrapper {...this.props} tabIndex={0}>
                    <SidebarIconInner>
                        <Icon name={this.props.iconName} size={IconSize.Large} />
                    </SidebarIconInner>
                </SidebarIconWrapper>
    }
}

export interface ISidebarViewProps extends ISidebarContainerProps {
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

export interface ISidebarWrapperProps {
    width: string
}

const SidebarWrapper = withProps<ISidebarWrapperProps>(styled.div)`
    pointer-events: auto;

    display: flex;
    flex-direction: column;

    color: ${props => props.theme["sidebar.foreground"]};
    background-color: ${props => props.theme["sidebar.background"]};
    width: ${props => props.width};
`

export class SidebarView extends React.PureComponent<ISidebarViewProps, {}> {
    public render(): JSX.Element {
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
                        focused={isFocused}
                    />
        })

        return <SidebarWrapper width={this.props.width}>
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
            </SidebarWrapper>

    }
}

export const mapStateToProps = (state: ISidebarState, containerProps: ISidebarContainerProps): ISidebarViewProps => {
    return {
        ...containerProps,
        entries: state.entries,
        activeEntryId: state.activeEntryId,
        focusedEntryId: state.focusedEntryId,
        visible: true,
        width: "50px",
    }
}

export const Sidebar = connect(mapStateToProps)(SidebarView)
