/**
 * SidebarItemView.tsx
 *
 * Shared component for sidebar items
 */

import * as React from "react"
import styled from "styled-components"

import { withProps } from "./common"

export interface ISidebarItemViewProps {
    text: string | JSX.Element
    isFocused: boolean
    isContainer: boolean
    indentationLevel: number
    icon?: JSX.Element
}

const px = (num: number): string => num.toString() + "px"

const SidebarItemStyleWrapper = withProps<ISidebarItemViewProps>(styled.div)`
    padding-left: ${props => px(INDENT_AMOUNT * props.indentationLevel)};
    border-left: ${props =>
        props.isFocused
            ? "4px solid " + props.theme["highlight.mode.normal.background"]
            : "4px solid transparent"};

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-top: 4px;
    padding-bottom: 4px;
    position: relative;

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
            <SidebarItemStyleWrapper {...this.props} className="item">
                <SidebarItemBackground {...this.props} />
                {icon}
                <div className="name">{this.props.text}</div>
            </SidebarItemStyleWrapper>
        )
    }
}

export interface ISidebarContainerViewProps {
    text: string
    isExpanded: boolean
    isFocused: boolean
    indentationLevel?: number
    isContainer?: boolean
    isOver?: boolean
}

const SidebarContainer = withProps<{ isOver?: boolean }>(styled.div)`
    ${p => p.isOver && `border: 3px solid ${p.theme["highlight.mode.insert.background"]};`};
`

export class SidebarContainerView extends React.PureComponent<ISidebarContainerViewProps, {}> {
    public render(): JSX.Element {
        const caretStyle = {
            transform: this.props.isExpanded ? "rotateZ(45deg)" : "rotateZ(0deg)",
            transition: "transform 0.1s ease-in",
        }
        const icon = <i style={caretStyle} className="fa fa-caret-right" />
        const indentationlevel = this.props.indentationLevel || 0

        return (
            <SidebarContainer isOver={this.props.isOver}>
                <SidebarItemView
                    indentationLevel={indentationlevel}
                    icon={icon}
                    text={this.props.text}
                    isFocused={this.props.isFocused}
                    isContainer={this.props.isContainer}
                />
                {this.props.isExpanded ? this.props.children : null}
            </SidebarContainer>
        )
    }
}
