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
`

const ButtonWrapper = styled.button`
    background-color: ${props => props.theme["highlight.mode.normal.background"]};
    color: ${props => props.theme["highlight.mode.normal.foreground"]};
    margin: 4px;
`

const Description = styled.div`
    margin: 8px;
    font-size: 0.9em;
    text-align: center;
`

export interface IOniButtonProps {
    text: string
    click: () => void
}

export class OniButton extends React.PureComponent<IOniButtonProps, {}> {
    public render(): JSX.Element {}
}

export class SidebarEmptyPaneView extends React.PureComponent<ISidebarEmptyPaneViewProps, {}> {
    public render(): JSX.Element {
        const button = this.props.actionButtonText ? (
            <Button>{this.props.actionButtonText}</Button>
        ) : null

        return (
            <Wrapper>
                <Description>{this.props.contentsText}</Description>
                {button}
            </Wrapper>
        )
    }
}
