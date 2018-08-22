/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import { inputManager, InputManager } from "./../../Services/InputManager"

import * as Oni from "oni-api"

import { withProps } from "./../../UI/components/common"
import { VimNavigator } from "./../../UI/components/VimNavigator"

const WelcomeWrapper = withProps<{}>(styled.div)`
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};

    overflow-y: auto;
    -webkit-user-select: none;

    width: 100%;
    height: 100%;
    opacity: 0;
`

// const entrance = keyframes`
//     0% { opacity: 0; transform: translateY(2px); }
//     100% { opacity: 0.5; transform: translateY(0px); }
// `

const entranceFull = keyframes`
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0px); }
`

// const enterLeft = keyframes`
//     0% { opacity: 0; transform: translateX(-4px); }
//     100% { opacity: 1; transform: translateX(0px); }
// `

// const enterRight = keyframes`
//     0% { opacity: 0; transform: translateX(4px); }
//     100% { opacity: 1; transform: translateX(0px); }
// `

const Column = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    width: 100%;
    flex: 1 1 auto;
`

const Row = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    opacity: 0;
`

const TitleText = styled.div`
    font-size: 2em;
    text-align: right;
`

const SubtitleText = styled.div`
    font-size: 1.2em;
    text-align: right;
`

const HeroImage = styled.img`
    width: 192px;
    height: 192px;
    opacity: 0.4;
`

const SectionHeader = styled.div`
    margin-top: 1em;
    margin-bottom: 1em;

    font-size: 1.1em;
    font-weight: bold;
    text-align: center;
    width: 100%;
`

const WelcomeButtonHoverStyled = `
    transform: translateY(-1px);
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`

// box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);

export interface WelcomeButtonWrapperProps {
    selected: boolean
}

const WelcomeButtonWrapper = withProps<WelcomeButtonWrapperProps>(styled.div)`
    border: 0px solid ${props => props.theme.foreground};
    border-left: ${props =>
        props.selected
            ? "4px solid " + props.theme["highlight.mode.normal.background"]
            : "4px solid transparent"};
    border-right: 4px solid transparent;
    color: ${props => props.theme.foreground};
    background-color: ${props => props.theme.background};

    cursor: pointer;

    transition: transform 0.25s;
    transform: ${props => (props.selected ? "translateX(-4px)" : "translateX(0px)")};

    width: 100%;
    margin: 8px 0px;
    padding: 8px;

    display: flex;
    flex-direction: row;

    &:hover {
       ${WelcomeButtonHoverStyled}
    }

`

const WelcomeButtonTitle = styled.span`
    font-size: 1.1em;
    font-weight: bold;
    margin: 4px;
    width: 100%;
`

const WelcomeButtonDescription = styled.span`
    font-size: 0.8em;
    opacity: 0.75;
    margin: 4px;

    width: 100%;
    text-align: right;
`

export interface WelcomeButtonProps {
    title: string
    description: string
    command: string
    selected: boolean
}

export class WelcomeButton extends React.PureComponent<WelcomeButtonProps, {}> {
    public render(): JSX.Element {
        return (
            <WelcomeButtonWrapper selected={this.props.selected}>
                <WelcomeButtonTitle>{this.props.title}</WelcomeButtonTitle>
                <WelcomeButtonDescription>{this.props.description}</WelcomeButtonDescription>
            </WelcomeButtonWrapper>
        )
    }
}

export interface WelcomeHeaderState {
    version: string
}

export class WelcomeBufferLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.welcome"
    }

    public get friendlyName(): string {
        return "Welcome"
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return (
            <WelcomeWrapper
                className="enable-mouse"
                style={{ animation: `${entranceFull} 0.25s ease-in 0.1s forwards` }}
            >
                <WelcomeView inputManager={inputManager} />
            </WelcomeWrapper>
        )
    }
}

export interface WelcomeViewProps {
    inputManager: InputManager
}

export interface WelcomeViewState {
    version: string
}

import { getMetadata } from "./../../Services/Metadata"

export const ButtonIds = [
    "oni.tutor.open",
    "oni.docs.open",
    "oni.configuration.open",
    "oni.themes.open",
    "workspace.newFile",
    "workspace.openFolder",
    "tasks.show",
    "editor.openExCommands",
]

export class WelcomeView extends React.PureComponent<WelcomeViewProps, WelcomeViewState> {
    public state: WelcomeViewState = {
        version: null,
    }

    public async componentDidMount() {
        const metadata = await getMetadata()
        this.setState({ version: metadata.version })
    }

    public render() {
        if (!this.state.version) {
            return null
        }

        return (
            <Column>
                <Row
                    style={{
                        width: "100%",
                        paddingTop: "32px",
                        animation: `${entranceFull} 0.25s ease-in 0.25s forwards`,
                    }}
                >
                    <Column />
                    <Column style={{ alignItems: "flex-end" }}>
                        <TitleText>Oni</TitleText>
                        <SubtitleText>Modern Modal Editing</SubtitleText>
                    </Column>
                    <Column style={{ flex: "0 0" }}>
                        <HeroImage src="images/oni-icon-no-border.svg" />
                    </Column>
                    <Column style={{ alignItems: "flex-start" }}>
                        <SubtitleText>{"v" + this.state.version}</SubtitleText>
                        <div>{"https://onivim.io"}</div>
                    </Column>
                    <Column />
                </Row>
                <Row style={{ width: "100%", marginTop: "64px", opacity: 1 }}>
                    <Column />
                    <VimNavigator
                        active={true}
                        style={{ width: "100%" }}
                        ids={ButtonIds}
                        render={selectedId => (
                            <WelcomeBufferLayerCommandsView selectedId={selectedId} />
                        )}
                    />
                    <Column />
                </Row>
            </Column>
        )
    }
}

export interface IWelcomeBufferLayerCommandsViewProps {
    selectedId: string
}

export class WelcomeBufferLayerCommandsView extends React.PureComponent<
    IWelcomeBufferLayerCommandsViewProps,
    {}
> {
    public render(): JSX.Element {
        return (
            <Column style={{ width: "100%" }}>
                <div
                    style={{
                        width: "100%",
                        animation: `${entranceFull} 0.25s ease-in 0.5s both`,
                    }}
                >
                    <SectionHeader>Learn</SectionHeader>
                    <WelcomeButton
                        title="Tutor"
                        description="Learn modal editing with an interactive tutorial."
                        command="oni.tutor.open"
                        selected={this.props.selectedId === "oni.tutor.open"}
                    />
                    <WelcomeButton
                        title="Documentation"
                        description="Discover what Oni can do for you."
                        command="oni.docs.open"
                        selected={this.props.selectedId === "oni.docs.open"}
                    />
                </div>
                <div
                    style={{
                        width: "100%",
                        animation: `${entranceFull} 0.25s ease-in 0.75s both`,
                    }}
                >
                    <SectionHeader>Customize</SectionHeader>
                    <WelcomeButton
                        title="Configure"
                        description="Make Oni work the way you want."
                        command="oni.configuration.open"
                        selected={this.props.selectedId === "oni.configuration.open"}
                    />
                    <WelcomeButton
                        title="Themes"
                        description="Choose a theme that works for you."
                        command="oni.themes.open"
                        selected={this.props.selectedId === "oni.themes.open"}
                    />
                </div>
                <div
                    style={{
                        width: "100%",
                        animation: `${entranceFull} 0.25s ease-in 1s both`,
                    }}
                >
                    <SectionHeader>Quick Commands</SectionHeader>
                    <WelcomeButton
                        title="New File"
                        description="Control + N"
                        command="workspace.newFile"
                        selected={this.props.selectedId === "workspace.newFile"}
                    />
                    <WelcomeButton
                        title="Open File / Folder"
                        description="Control + O"
                        command="workspace.openFolder"
                        selected={this.props.selectedId === "workspace.openFolder"}
                    />
                    <WelcomeButton
                        title="Command Palette"
                        description="Control + Shift + P"
                        command="tasks.show"
                        selected={this.props.selectedId === "tasks.show"}
                    />
                    <WelcomeButton
                        title="Vim Ex Commands"
                        description=":"
                        command="editor.openExCommands"
                        selected={this.props.selectedId === "editor.openExCommands"}
                    />
                </div>
            </Column>
        )
    }
}
