/**
 * SidebarItemView.tsx
 *
 * Shared component for sidebar items
 */

import * as React from "react"

import { OniStyledProps, pixel, styled, withProps } from "./common"

import Caret from "./../../UI/components/Caret"
import { Sneakable } from "./../../UI/components/Sneakable"

interface IItemProps {
    yanked?: boolean
    updated?: boolean
    isOver?: boolean
    canDrop?: boolean
    didDrop?: boolean
    isFocused: boolean
    isContainer?: boolean
    icon?: JSX.Element
    text: string | JSX.Element
    onClick: (e?: React.MouseEvent<HTMLElement>) => void
}

export interface ISidebarItemViewProps extends IItemProps {
    indentationLevel: number
}

export interface ISidebarContainerViewProps extends IItemProps {
    isExpanded: boolean
    indentationLevel?: number
}

type SidebarStyleProps = OniStyledProps<ISidebarItemViewProps>

const INDENT_AMOUNT = 12

const getLeftBorder = (props: SidebarStyleProps) => {
    switch (true) {
        case props.isFocused:
            return `4px solid  ${props.theme["highlight.mode.normal.background"]}`
        case !props.isContainer:
            return "4px solid transparent"
        case props.isContainer:
            return `4px solid rgba(0, 0, 0, 0.2)`
        default:
            return ""
    }
}

const SidebarItemStyleWrapper = withProps<ISidebarItemViewProps>(styled.div)`
    padding-left: ${props => pixel(INDENT_AMOUNT * props.indentationLevel)};
    border-left: ${getLeftBorder};
    ${p =>
        (p.isOver || p.yanked) &&
        `border: 3px solid ${p.theme["highlight.mode.insert.background"]};`};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-top: 4px;
    padding-bottom: 3px;
    position: relative;
    cursor: pointer;
    pointer-events: all;

    .icon {
        flex: 0 0 auto;
        width: 20px;
        text-align: center;
        margin-right: 1px;
    }

    .name {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`

const getSidebarBackground = (props: SidebarStyleProps) => {
    if (props.isFocused && !props.isContainer) {
        return props.theme["highlight.mode.normal.background"]
    } else if (props.isContainer) {
        return "rgb(0, 0, 0)"
    } else {
        return "transparent"
    }
}

const SidebarItemBackground = withProps<ISidebarItemViewProps>(styled.div)`
    background-color: ${getSidebarBackground};
    opacity: ${props => (props.isContainer || props.isFocused ? "0.2" : "0")};
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
`

export const SidebarItemView: React.SFC<ISidebarItemViewProps> = props => {
    const icon = props.icon ? <div className="icon">{props.icon}</div> : null
    return (
        <Sneakable callback={props.onClick}>
            <SidebarItemStyleWrapper {...props} className="item" onClick={props.onClick}>
                <SidebarItemBackground {...props} />
                {icon}
                <div className="name">{props.text}</div>
            </SidebarItemStyleWrapper>
        </Sneakable>
    )
}
const SidebarContainer = styled.div``

export const SidebarContainerView: React.SFC<ISidebarContainerViewProps> = ({
    indentationLevel = 0,
    ...props
}) => {
    return (
        <SidebarContainer>
            <SidebarItemView
                yanked={props.yanked}
                updated={props.updated}
                didDrop={props.didDrop}
                indentationLevel={indentationLevel}
                icon={<Caret active={props.isExpanded} />}
                text={props.text}
                isFocused={props.isFocused}
                isContainer={props.isContainer}
                onClick={props.onClick}
            />
            {props.isExpanded ? props.children : null}
        </SidebarContainer>
    )
}
