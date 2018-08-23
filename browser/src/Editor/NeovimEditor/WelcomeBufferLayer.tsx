/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as React from "react"
import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { Event } from "oni-types"

import { getMetadata } from "./../../Services/Metadata"
import styled, { css, Css, enableMouse, keyframes } from "./../../UI/components/common"

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
const WelcomeWrapper = styled.div`
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};
    overflow-y: hidden;
    user-select: none;
    pointer-events: all;
    width: 100%;
    height: 100%;
    opacity: 0;
    animation: ${entranceFull} 0.25s ease-in 0.1s forwards ${enableMouse};
`
interface IColumnProps {
    alignment?: string
    flex?: string
    height?: string
    overflowY?: string
}

const Column = styled<IColumnProps, "div">("div")`
    background: ${p => p.theme["editor.background"]};
    display: flex;
    justify-content: center;
    align-items: ${({ alignment }) => alignment || "center"};
    flex-direction: column;
    width: 100%;
    flex: ${({ flex }) => flex || "1 1 auto"};
    height: ${({ height }) => height || `auto`};
    ${({ overflowY }) => overflowY && `overflow-y: ${overflowY}`};
`

const Row = styled<{ extension?: Css }, "div">("div")`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    opacity: 0;
    ${({ extension }) => extension};
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

export interface WelcomeButtonWrapperProps {
    selected: boolean
}

const WelcomeButtonWrapper = styled<WelcomeButtonWrapperProps, "button">("button")`
    box-sizing: content-box;
    font-size: inherit;
    font-family: inherit;
    border: 0px solid ${props => props.theme.foreground};
    border-left: ${({ selected, theme }) =>
        selected
            ? "4px solid " + theme["highlight.mode.normal.background"]
            : "4px solid transparent"};
    border-right: 4px solid transparent;
    cursor: pointer;
    color: ${({ theme }) => theme.foreground};
    background-color: ${({ theme }) => theme.background};
    transform: ${({ selected }) => (selected ? "translateX(-4px)" : "translateX(0px)")};
    transition: transform 0.25s;
    width: 100%;
    margin: 8px 0px;
    padding: 8px;
    display: flex;
    flex-direction: row;
    &:hover {
        ${WelcomeButtonHoverStyled};
    }
`

const AnimatedContainer = styled<{ duration: string }, "div">("div")`
    width: 100%;
    animation: ${entranceFull} ${p => p.duration} ease-in 1s both;
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

interface IChromeDiv extends HTMLButtonElement {
    scrollIntoViewIfNeeded: () => void
}

export class WelcomeButton extends React.PureComponent<WelcomeButtonProps> {
    private _button = React.createRef<IChromeDiv>()

    public componentDidUpdate(prevProps: WelcomeButtonProps) {
        if (!prevProps.selected && this.props.selected) {
            this._button.current.scrollIntoViewIfNeeded()
        }
    }

    public render() {
        return (
            <WelcomeButtonWrapper
                innerRef={this._button}
                selected={this.props.selected}
                onClick={this.props.onClick}
            >
                <WelcomeButtonTitle>{this.props.title}</WelcomeButtonTitle>
                <WelcomeButtonDescription>{this.props.description}</WelcomeButtonDescription>
            </WelcomeButtonWrapper>
        )
    }
}

export interface WelcomeHeaderState {
    version: string
}

export interface OniWithActiveSection extends Oni.Plugin.Api {
    getActiveSection(): string
}

interface IWelcomInputEvent {
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
    commandline: string
}

export class WelcomeBufferLayer implements Oni.BufferLayer {
    constructor(private _oni: OniWithActiveSection) {}

    public inputEvent = new Event<IWelcomInputEvent>()

    public welcomeCommands: IWelcomeCommandsDictionary = {
        openTutor: "oni.tutor.open",
        openDocs: "oni.docs.open",
        openConfig: "oni.config.openUserConfig",
        openThemes: "oni.themes.open",
        openFile: "oni.quickOpen.openFileNewTab",
        openWorkspaceFolder: "workspace.openFolder",
        commandPalette: "quickOpen.show",
        commandline: "executeVimCommand",
    }

    public get id(): string {
        return "oni.welcome"
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
    inputEvent: Event<IWelcomInputEvent>
    commands: IWelcomeCommandsDictionary
    executeCommand: (cmd: string) => void
}

export interface WelcomeViewState {
    version: string
    selectedId: string
    currentIndex: number
}

const buttonsRow = css`
    width: 100%;
    margin-top: 64px;
    opacity: 1;
`

const titleRow = css`
    width: 100%;
    padding-top: 32px;
    animation: ${entranceFull} 0.25s ease-in 0.25s forwards};
`

export class WelcomeView extends React.PureComponent<WelcomeViewProps, WelcomeViewState> {
    private _welcomeElement = React.createRef<HTMLDivElement>()
    public state: WelcomeViewState = {
        version: null,
        currentIndex: 0,
        selectedId: this.props.buttonIds[0],
    }

    public async componentDidMount() {
        const metadata = await getMetadata()
        this.setState({ version: metadata.version })
        this.props.inputEvent.subscribe(this.handleInput)
    }

    public handleInput = ({ direction, select }: IWelcomInputEvent) => {
        const { currentIndex } = this.state
        const newIndex = this.getNextIndex(direction, currentIndex)
        const selectedId = this.props.buttonIds[newIndex]
        this.setState({ currentIndex: newIndex, selectedId })
        if (select) {
            this.props.executeCommand(selectedId)
        }
    }

    public getNextIndex(direction: number, currentIndex: number) {
        const nextPosition = currentIndex + direction
        switch (true) {
            case nextPosition < 0:
                return this.props.buttonIds.length - 1
            case nextPosition === this.props.buttonIds.length:
                return 0
            default:
                return nextPosition
        }
    }

    componentDidUpdate() {
        if (this.props.active && this._welcomeElement && this._welcomeElement.current) {
            this._welcomeElement.current.focus()
        }
    }

    public render() {
        const { version } = this.state
        return version ? (
            <Column innerRef={this._welcomeElement} height="100%">
                <Row extension={titleRow}>
                    <Column />
                    <Column alignment="flex-end">
                        <TitleText>Oni</TitleText>
                        <SubtitleText>Modern Modal Editing</SubtitleText>
                    </Column>
                    <Column flex="0 0">
                        <HeroImage src="images/oni-icon-no-border.svg" />
                    </Column>
                    <Column alignment="flex-start">
                        <SubtitleText>{`v${this.state.version}`}</SubtitleText>
                        <div>{"https://onivim.io"}</div>
                    </Column>
                    <Column />
                </Row>
                <Row extension={buttonsRow}>
                    <Column />
                    <WelcomeCommandsView
                        commands={this.props.commands}
                        selectedId={this.state.selectedId}
                        executeCommand={this.props.executeCommand}
                    />
                    <Column />
                </Row>
            </Column>
        ) : null
    }
}

export interface IWelcomeCommandsViewProps extends Partial<WelcomeViewProps> {
    selectedId: string
}

export class WelcomeCommandsView extends React.PureComponent<IWelcomeCommandsViewProps, {}> {
    public render() {
        const { commands, executeCommand } = this.props
        return (
            <Column>
                <AnimatedContainer duration="0.25s">
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
                </AnimatedContainer>
                <AnimatedContainer duration="0.25s">
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
                </AnimatedContainer>
                <AnimatedContainer duration="0.25s">
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
                        onClick={() => executeCommand(commands.commandline)}
                        selected={this.props.selectedId === commands.commandline}
                    />
                </AnimatedContainer>
            </Column>
        )
    }
}
