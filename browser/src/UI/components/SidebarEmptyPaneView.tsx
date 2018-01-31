/**
 * SidebarEmptyPaneView.tsx
 */

import * as React from "react"
import styled from "styled-components"

export interface ISidebarEmptyPaneViewProps {
    contentsText: string
    actionButtonText?: string
}

const Wrapper = styled.div`
    border-top: 1px solid ${props => props.theme["background"]};

    display: flex;
    flex-direction: column;
    justify-content: center;
`

import { boxShadow } from "./common"

const ButtonWrapper = styled.button`
    background-color: ${props => props.theme["background"]};
    color: ${props => props.theme["foreground"]};
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

const ButtonContainer = styled.div`
    padding: 32px;
    padding: 32px;
`

import { VimNavigator } from "./VimNavigator"

export interface IOniButtonProps {
    text: string
    onClick: () => void
}

export class OniButton extends React.PureComponent<IOniButtonProps, {}> {
    public render(): JSX.Element {
        return (
            <ButtonWrapper>
                <span>{this.props.text}</span>
            </ButtonWrapper>
        )
    }
}

export class SidebarEmptyPaneView extends React.PureComponent<ISidebarEmptyPaneViewProps, {}> {
    public render(): JSX.Element {
        const button = this.props.actionButtonText ? (
            <OniButton text={this.props.actionButtonText} onClick={() => {}} />
        ) : null

        return (
            <VimNavigator
                ids={[]}
                active={false}
                render={() => {
                    return (
                        <Wrapper>
                            <Description>{this.props.contentsText}</Description>
                            <ButtonContainer>{button}</ButtonContainer>
                        </Wrapper>
                    )
                }}
            />
        )
    }
}
