/**
 * SidebarItemView.tsx
 *
 * Shared component for sidebar items
 */

import * as React from "react"

import { styled, withProps } from "./common"

import Caret from "./../../UI/components/Caret"
import { Sneakable } from "./../../UI/components/Sneakable"

export interface ISidebarItemViewProps {
    yanked?: boolean
    updated?: boolean
    isOver?: boolean
    canDrop?: boolean
    didDrop?: boolean
    text: string | JSX.Element
    isFocused: boolean
    isContainer?: boolean
    indentationLevel: number
    icon?: JSX.Element
    onClick: (e?: React.MouseEvent<HTMLElement>) => void
}

const px = (num: number): string => num.toString() + "px"

const SidebarItemStyleWrapper = withProps<ISidebarItemViewProps>(styled.div)`
    padding-left: ${props => px(INDENT_AMOUNT * props.indentationLevel)};
    border-left: ${props =>
        props.isFocused
            ? `4px solid  ${props.theme["highlight.mode.normal.background"]}`
            : "4px solid transparent"};

    ${p =>
        (p.isOver || p.yanked) &&
        `border: 3px solid ${p.theme["highlight.mode.insert.background"]};`};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-top: 4px;
    padding-bottom: 4px;
    position: relative;

    cursor: pointer;
    pointer-events: all;

    .icon {
        flex: 0 0 auto;
        width: 20px;
        text-align: center;
        margin-right: 7px;
    }

    .name {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`

const SidebarItemBackground = withProps<ISidebarItemViewProps>(styled.div)`
    background-color: ${props => {
        if (props.isFocused && !props.isContainer) {
            return props.theme["highlight.mode.normal.background"]
        } else if (props.isContainer) {
            return "rgb(0, 0, 0)"
        } else {
            return "transparent"
        }
    }};
    opacity: ${props => (props.isContainer || props.isFocused ? "0.2" : "0")};

    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
`

const INDENT_AMOUNT = 6

export class SidebarItemView extends React.PureComponent<ISidebarItemViewProps, {}> {
    public render(): JSX.Element {
        const icon = this.props.icon ? <div className="icon">{this.props.icon}</div> : null
        return (
            <Sneakable callback={this.props.onClick}>
                <SidebarItemStyleWrapper
                    {...this.props}
                    className="item"
                    onClick={this.props.onClick}
                >
                    <SidebarItemBackground {...this.props} />
                    {icon}
                    <div className="name">{this.props.text}</div>
                </SidebarItemStyleWrapper>
            </Sneakable>
        )
    }
}

export interface ISidebarContainerViewProps extends IContainerProps {
    yanked?: boolean
    updated?: boolean
    didDrop?: boolean
    text: string
    isExpanded: boolean
    isFocused: boolean
    indentationLevel?: number
    isContainer?: boolean
    onClick: (e: React.MouseEvent<HTMLElement>) => void
}

interface IContainerProps {
    isOver?: boolean
    canDrop?: boolean
    yanked?: boolean
    updated?: boolean
}

const SidebarContainer = withProps<IContainerProps>(styled.div)`
    ${p =>
        (p.isOver || p.yanked) &&
        `border: 3px solid ${p.theme["highlight.mode.insert.background"]};`};
`

export class SidebarContainerView extends React.PureComponent<ISidebarContainerViewProps, {}> {
    public render(): JSX.Element {
        const indentationlevel = this.props.indentationLevel || 0

        return (
            <SidebarContainer
                updated={this.props.updated}
                yanked={this.props.yanked}
                canDrop={this.props.canDrop}
                isOver={this.props.isOver}
            >
                <SidebarItemView
                    yanked={this.props.yanked}
                    updated={this.props.updated}
                    didDrop={this.props.didDrop}
                    indentationLevel={indentationlevel}
                    icon={<Caret active={this.props.isExpanded} />}
                    text={this.props.text}
                    isFocused={this.props.isFocused}
                    isContainer={this.props.isContainer}
                    onClick={this.props.onClick}
                />
                {this.props.isExpanded ? this.props.children : null}
            </SidebarContainer>
        )
    }
}
