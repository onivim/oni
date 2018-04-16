/**
 * SidebarEmptyPaneView.tsx
 */

import * as React from "react"
import styled from "styled-components"
import { boxShadow, withProps } from "./common"

const ButtonWrapper = styled.button`
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.foreground};
    padding: 1em;
    border: 2px solid transparent;
    width: 100%;
    outline: none;
    cursor: pointer;
    transition: all 0.1s ease-in;

    pointer-events: all;

    &:hover {
        ${boxShadow} transform: translateY(-1px);
    }
`

export interface ButtonContainerProps {
    selected: boolean
}

const ButtonContainer = withProps<ButtonContainerProps>(styled.div)`
    padding-left: 32px;
    padding-right: 32px;

    transition: all 0.1s ease-in;

    background-color: ${props => (props.selected ? "rgba(0, 0, 0, 0.1)" : "transparent")};
    border-left: 2px solid ${props =>
        props.selected ? props.theme["highlight.mode.normal.background"] : "transparent"};
`

import { Sneakable } from "./Sneakable"

export interface ISidebarButtonProps {
    focused: boolean
    text: string | JSX.Element
    onClick: () => void
}

export class SidebarButton extends React.PureComponent<ISidebarButtonProps, {}> {
    public render(): JSX.Element {
        return (
            <ButtonContainer selected={this.props.focused}>
                <Sneakable callback={this.props.onClick}>
                    <ButtonWrapper onClick={this.props.onClick}>
                        <span>{this.props.text}</span>
                    </ButtonWrapper>
                </Sneakable>
            </ButtonContainer>
        )
    }
}
