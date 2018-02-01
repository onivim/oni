/**
 * SidebarEmptyPaneView.tsx
 */

import * as React from "react"
import styled from "styled-components"

export interface ISidebarEmptyPaneViewProps {
    active: boolean
    contentsText: string
    actionButtonText?: string
    onClickButton?: () => void
}

const Wrapper = styled.div`
    border-top: 1px solid ${props => props.theme.background};

    display: flex;
    flex-direction: column;
    justify-content: center;
`

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

    &:hover {
        ${boxShadow} transform: translateY(-1px);
    }
`

const Description = styled.div`
    margin: 32px;
    font-size: 0.9em;
    text-align: center;
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
import { VimNavigator } from "./VimNavigator"

export interface IOniButtonProps {
    text: string
    onClick: () => void
}

export class OniButton extends React.PureComponent<IOniButtonProps, {}> {
    public render(): JSX.Element {
        return (
            <Sneakable callback={this.props.onClick}>
                <ButtonWrapper onClick={this.props.onClick}>
                    <span>{this.props.text}</span>
                </ButtonWrapper>
            </Sneakable>
        )
    }
}

export class SidebarEmptyPaneView extends React.PureComponent<ISidebarEmptyPaneViewProps, {}> {
    public render(): JSX.Element {
        const button = this.props.actionButtonText ? (
            <OniButton
                text={this.props.actionButtonText}
                onClick={() => this.props.onClickButton && this.props.onClickButton()}
            />
        ) : null

        return (
            <VimNavigator
                ids={["empty.button"]}
                active={this.props.active}
                onSelected={() => this.props.onClickButton && this.props.onClickButton()}
                render={(selectedId: string) => {
                    return (
                        <Wrapper>
                            <Description>{this.props.contentsText}</Description>
                            <ButtonContainer selected={this.props.active}>{button}</ButtonContainer>
                        </Wrapper>
                    )
                }}
            />
        )
    }
}
