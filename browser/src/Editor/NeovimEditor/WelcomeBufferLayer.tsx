/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"
import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { Event } from "oni-types"

import styled, { keyframes, withProps, enableMouse } from "./../../UI/components/common"
import { getMetadata } from "./../../Services/Metadata"

// const entrance = keyframes`
//     0% { opacity: 0; transform: translateY(2px); }
//     100% { opacity: 0.5; transform: translateY(0px); }
// `

// const enterLeft = keyframes`
//     0% { opacity: 0; transform: translateX(-4px); }
//     100% { opacity: 1; transform: translateX(0px); }
// `

// const enterRight = keyframes`
//     0% { opacity: 0; transform: translateX(4px); }
//     100% { opacity: 1; transform: translateX(0px); }
// `

const entranceFull = keyframes`
    0% {
        opacity: 0;
        transform: translateY(8px);
    }
    100% {
        opacity: 1;
        transform: translateY(0px);
    }
`
const WelcomeWrapper = withProps<{}>(styled.div)`
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};
    overflow-y: auto;
    user-select: none;
    pointer-events: all;
    width: 100%;
    height: 100%;
    opacity: 0;
    animation: ${entranceFull} 0.25s ease-in 0.1s forwards 
    ${enableMouse};
`

const Column = styled.div`
    background: ${p => p.theme["editor.background"]};
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

const WelcomeButtonWrapper = withProps<WelcomeButtonWrapperProps>(styled.button)`
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
    onClick: () => void
}

export const WelcomeButton: React.SFC<WelcomeButtonProps> = props => {
    return (
        <WelcomeButtonWrapper selected={props.selected} onClick={props.onClick}>
            <WelcomeButtonTitle>{props.title}</WelcomeButtonTitle>
            <WelcomeButtonDescription>{props.description}</WelcomeButtonDescription>
        </WelcomeButtonWrapper>
    )
}

export interface WelcomeHeaderState {
    version: string
}

export interface UpdatedCommands extends Oni.Commands.Api {
    getTasks(): Oni.Commands.ICommand[]
}

export interface OniWithActiveSection extends Oni.Plugin.Api {
    getActiveSection(): string
    commands: UpdatedCommands
}

interface WelcomeInputEvent {
    direction: number
    select: boolean
}

interface IWelcomeCommandsDictionary {
    openFile: string
    openTutor: string
    openDocs: string
    openConfig: string
    openThemes: string
    openWorkspaceFolder: string
    commandPalette: string
}

export class WelcomeBufferLayer implements Oni.BufferLayer {
    constructor(private _oni: OniWithActiveSection) {}
    public get id(): string {
        return "oni.welcome"
    }

    public inputEvent = new Event<WelcomeInputEvent>()

    public welcomeCommands = {
        openFile: "oni.configuration.open",
        openTutor: "oni.tutor.open",
        openDocs: "oni.docs.open",
        openConfig: "oni.config.openUserConfig",
        openThemes: "oni.themes.open",
        openWorkspaceFolder: "workspace.openFolder",
        commandPalette: "quickOpen.show",
        // command: "editor.openExCommands",
    }

    public get friendlyName(): string {
        return "Welcome"
    }

    public handleInput(key: string) {
        Log.info(`ONI WELCOME INPUT KEY: ${key}`)
        switch (key) {
            case "j":
                this.inputEvent.dispatch({ direction: 1, select: false })
                break
            case "k":
                this.inputEvent.dispatch({ direction: -1, select: false })
                break
            case "<enter>":
                this.inputEvent.dispatch({ direction: 0, select: true })
                break
            default:
                this.inputEvent.dispatch({ direction: 0, select: false })
        }
    }

    public executeCommand = (cmd: string) => {
        if (cmd) {
            this._oni.commands.executeCommand(cmd)
        }
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        const active = this._oni.getActiveSection() === "editor"
        const ids = Object.values(this.welcomeCommands)
        return (
            <WelcomeWrapper>
                <WelcomeView
                    buttonIds={ids}
                    active={active}
                    inputEvent={this.inputEvent}
                    commands={this.welcomeCommands}
                    executeCommand={this.executeCommand}
                />
            </WelcomeWrapper>
        )
    }
}

export interface WelcomeViewProps {
    active: boolean
    buttonIds: string[]
    inputEvent: Event<WelcomeInputEvent>
    commands: IWelcomeCommandsDictionary
    executeCommand: (cmd: string) => void
}

export interface WelcomeViewState {
    version: string
    selectedId: string
    currentIndex: number
}

export class WelcomeView extends React.PureComponent<WelcomeViewProps, WelcomeViewState> {
    private _welcomeElement: HTMLDivElement
    public state: WelcomeViewState = {
        version: null,
        currentIndex: 0,
        selectedId: this.props.buttonIds[0],
    }

    public async componentDidMount() {
        const metadata = await getMetadata()
        this.setState({ version: metadata.version })

        this.props.inputEvent.subscribe(({ direction, select }) => {
            const { currentIndex } = this.state
            const newIndex = currentIndex + direction || 0
            const selectedId = this.props.buttonIds[newIndex]
            this.setState({ currentIndex: newIndex, selectedId })
            if (select) {
                this.props.executeCommand(selectedId)
            }
        })
    }

    componentDidUpdate() {
        if (this.props.active && this._welcomeElement) {
            this._welcomeElement.focus()
        }
    }

    public render() {
        if (!this.state.version) {
            return null
        }

        return (
            <Column innerRef={e => (this._welcomeElement = e)}>
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
                    <WelcomeBufferLayerCommandsView
                        commands={this.props.commands}
                        selectedId={this.state.selectedId}
                        executeCommand={this.props.executeCommand}
                    />
                    <Column />
                </Row>
            </Column>
        )
    }
}

export interface IWelcomeBufferLayerCommandsViewProps extends Partial<WelcomeViewProps> {
    selectedId: string
}

export class WelcomeBufferLayerCommandsView extends React.PureComponent<
    IWelcomeBufferLayerCommandsViewProps,
    {}
> {
    public render() {
        const { commands, executeCommand } = this.props
        return (
            <Column>
                <div
                    style={{
                        width: "100%",
                        animation: `${entranceFull} 0.25s ease-in 0.5s both`,
                    }}
                >
                    <SectionHeader>Learn</SectionHeader>
                    <WelcomeButton
                        title="Tutor"
                        onClick={() => executeCommand(commands.openTutor)}
                        description="Learn modal editing with an interactive tutorial."
                        command={commands.openTutor}
                        selected={this.props.selectedId === commands.openTutor}
                    />
                    <WelcomeButton
                        title="Documentation"
                        onClick={() => executeCommand(commands.openDocs)}
                        description="Discover what Oni can do for you."
                        command={commands.openDocs}
                        selected={this.props.selectedId === commands.openDocs}
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
                        onClick={() => executeCommand(commands.openConfig)}
                        description="Make Oni work the way you want."
                        command={commands.openConfig}
                        selected={this.props.selectedId === commands.openConfig}
                    />
                    <WelcomeButton
                        title="Themes"
                        onClick={() => executeCommand(commands.openThemes)}
                        description="Choose a theme that works for you."
                        command={commands.openThemes}
                        selected={this.props.selectedId === commands.openThemes}
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
                        onClick={() => executeCommand(commands.openFile)}
                        description="Control + N"
                        command={commands.openFile}
                        selected={this.props.selectedId === commands.openFile}
                    />
                    <WelcomeButton
                        title="Open File / Folder"
                        onClick={() => executeCommand(commands.openWorkspaceFolder)}
                        description="Control + O"
                        command={commands.openWorkspaceFolder}
                        selected={this.props.selectedId === commands.openWorkspaceFolder}
                    />
                    <WelcomeButton
                        title="Command Palette"
                        onClick={() => executeCommand(commands.commandPalette)}
                        description="Control + Shift + P"
                        command={commands.commandPalette}
                        selected={this.props.selectedId === commands.commandPalette}
                    />
                    <WelcomeButton
                        title="Vim Ex Commands"
                        description=":"
                        command="editor.openExCommands"
                        onClick={() => executeCommand("editor.openExCommands")}
                        selected={this.props.selectedId === "editor.openExCommands"}
                    />
                </div>
            </Column>
        )
    }
}
