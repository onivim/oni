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

import { SidebarButton } from "./SidebarButton"
import { VimNavigator } from "./VimNavigator"

const Description = styled.div`
    margin: 32px;
    font-size: 0.9em;
    text-align: center;
`

export class SidebarEmptyPaneView extends React.PureComponent<ISidebarEmptyPaneViewProps, {}> {
    public render(): JSX.Element {
        const button = this.props.actionButtonText ? (
            <SidebarButton
                focused={this.props.active}
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
                            {button}
                        </Wrapper>
                    )
                }}
            />
        )
    }
}
