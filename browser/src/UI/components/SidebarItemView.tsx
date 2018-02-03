/**
 * SidebarItemView.tsx
 *
 * Shared component for sidebar items
 */

import * as React from "react"
import styled from "styled-components"

import { withProps } from "./common"

export interface ISidebarItemViewProps {
    text: string
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
    padding: 4px;
    position: relative;

    .icon {
        flex: 0 0 auto;
        width: 20px;
        text-align: center;
        margin-right: 7px;
    }

    .name {
        flex: 1 1 auto;
    }
`

const SidebarItemBackground = withProps<ISidebarItemViewProps>(styled.div)`
    background-color: ${props => {
        if (props.isFocused) {
            return props.theme["highlight.mode.normal.background"]
        } else {
            return "rgb(0, 0, 0)"
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
        return (
            <SidebarItemStyleWrapper {...this.props} className="item">
                <SidebarItemBackground {...this.props} />
                <div className="icon">{this.props.icon}</div>
                <div className="name">{this.props.text}</div>
            </SidebarItemStyleWrapper>
        )
    }
}

export interface ISidebarContainerViewProps {
    text: string
    isExpanded: boolean
    isFocused: boolean
}

export class SidebarContainerView extends React.PureComponent<ISidebarContainerViewProps, {}> {
    public render(): JSX.Element {
        const caretStyle = {
            transform: this.props.isExpanded ? "rotateZ(45deg)" : "rotateZ(0deg)",
        }
        const icon = <i style={caretStyle} className="fa fa-caret-right" />

        return (
            <div>
                <SidebarItemView
                    indentationLevel={0}
                    icon={icon}
                    text={this.props.text}
                    isFocused={this.props.isFocused}
                    isContainer={true}
                />
                {this.props.isExpanded ? this.props.children : null}
            </div>
        )
    }
}
