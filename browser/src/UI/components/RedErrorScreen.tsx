/**
 * Component displaying an error message when there is a failure
 */

import * as React from "react"
import styled from "styled-components"

export interface RedErrorScreenViewProps {
    error: Error
    info: React.ErrorInfo
}

const RedScreenWrapper = styled.div`
    width: 100%;
    height: 100%;
    background-color: rgba(255, 56, 96, 0.5);
    color: white;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    pointer-events: all;
`

const RedScreenContentsWrapper = styled.div`
    max-width: 800px;
`

const HeaderTitleWrapper = styled.div`
    font-size: 2em;
    font-weight: bold;
`

const HeaderSubtitleWrapper = styled.div`
    font-size: 1.2em
    font-weight: bold;
`

const ErrorSectionWrapper = styled.div`
    font-weight: bold;
    margin-top: 3em;
    margin-bottom: 1em;
`

const ErrorTextWrapper = styled.div`
    -webkit-user-select: text;
`

const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: row;

    margin-top: 4em;
`

import { OniButton } from "./SidebarEmptyPaneView"

import { remote } from "electron"

const openDebugger = () => remote.getCurrentWebContents().openDevTools()
const createIssue = () => remote.shell.openExternal("https://github.com/onivim/oni/issues/new")

export class RedErrorScreenView extends React.PureComponent<RedErrorScreenViewProps> {
    public render(): JSX.Element {
        const errorMessage = this.props.error
            ? this.props.error.toString()
            : "Unable to get error info"

        const additionalStack =
            this.props.info && this.props.info.componentStack
                ? this.props.info.componentStack.toString()
                : "None"

        return (
            <RedScreenWrapper>
                <RedScreenContentsWrapper>
                    <HeaderTitleWrapper>Oh no!</HeaderTitleWrapper>
                    <HeaderSubtitleWrapper>We encountered an error...</HeaderSubtitleWrapper>
                    <ErrorSectionWrapper>Error:</ErrorSectionWrapper>
                    <ErrorTextWrapper>{errorMessage}</ErrorTextWrapper>
                    <ErrorSectionWrapper>Additional Info:</ErrorSectionWrapper>
                    <ErrorTextWrapper>{additionalStack}</ErrorTextWrapper>
                </RedScreenContentsWrapper>
                <ButtonsWrapper>
                    <OniButton focused={false} text="Open Debugger" onClick={openDebugger} />
                    <OniButton focused={false} text="Create an Issue" onClick={createIssue} />
                </ButtonsWrapper>
            </RedScreenWrapper>
        )
    }
}
