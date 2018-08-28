/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { Event } from "oni-types"
import * as React from "react"

import { getMetadata } from "./../../Services/Metadata"
import { ISession, SessionManager } from "./../../Services/Sessions"
import styled, {
    boxShadowInset,
    Css,
    css,
    enableMouse,
    getSelectedBorder,
    keyframes,
    lighten,
} from "./../../UI/components/common"
import { Icon } from "./../../UI/Icon"

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
    justify?: string
    flex?: string
    height?: string
    extension?: Css
}

const Column = styled<IColumnProps, "div">("div")`
    background: inherit;
    display: flex;
    justify-content: ${({ justify }) => justify || `center`};
    align-items: ${({ alignment }) => alignment || "center"};
    flex-direction: column;
    width: 100%;
    flex: ${({ flex }) => flex || "1"};
    height: ${({ height }) => height || `auto`};
    ${({ extension }) => extension};
`

const sectionStyles = css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 90%;
    overflow-y: hidden;
`

const LeftColumn = styled.div`
    ${sectionStyles};
    padding: 0;
    padding-left: 1rem;
    overflow-y: hidden;
    width: 60%;
    direction: rtl;

    &:hover {
        overflow-y: overlay;
    }

    & > * {
        direction: ltr;
    }
`

const RightColumn = styled.div`
    ${sectionStyles};
    width: 30%;
    border-left: 1px solid ${({ theme }) => theme["editor.background"]};
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
    text-align: left;
    width: 100%;
`

const WelcomeButtonHoverStyled = `
    transform: translateY(-1px);
    box-shadow: 0 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`

export interface WelcomeButtonWrapperProps {
    isSelected: boolean
    borderSize: string
}

const WelcomeButtonWrapper = styled<WelcomeButtonWrapperProps, "button">("button")`
    box-sizing: border-box;
    font-size: inherit;
    font-family: inherit;
    border: 0px solid ${props => props.theme.foreground};
    border-left: ${getSelectedBorder};
    border-right: 4px solid transparent;
    cursor: pointer;
    color: ${({ theme }) => theme.foreground};
    background-color: ${({ theme }) => lighten(theme.background)};
    transform: ${({ isSelected }) => (isSelected ? "translateX(-4px)" : "translateX(0px)")};
    transition: transform 0.25s;
    width: 100%;
    margin: 0.8rem 0;
    padding: 0.8rem;
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
    font-size: 1rem;
    font-weight: bold;
    margin: 0.4rem;
    width: 100%;
    text-align: left;
`

const WelcomeButtonDescription = styled.span`
    font-size: 0.8rem;
    opacity: 0.75;
    margin: 4px;
    width: 100%;
    text-align: right;
`

const boxStyling = css`
    width: 70%;
    height: 60%;
    box-sizing: border-box;
    padding: 0 1rem;
    margin-top: 64px;
    opacity: 1;
    border: 1px solid ${p => p.theme["editor.hover.contents.background"]};
    border-radius: 4px;
    justify-content: space-between;
    overflow: hidden;
    background-color: ${p => p.theme["editor.hover.contents.codeblock.background"]};
    ${boxShadowInset};
`

const titleRow = css`
    width: 100%;
    padding-top: 32px;
    animation: ${entranceFull} 0.25s ease-in 0.25s forwards};
`

const SectionItem = styled<{ isSelected?: boolean }, "li">("li")`
    width: 100%;
    margin: 0.2rem;
    text-align: left;
    height: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ isSelected }) => isSelected && `text-decoration: underline`};
    ${({ theme, isSelected }) =>
        isSelected && `color: ${theme["highlight.mode.normal.background"]}`};

    &:hover {
        text-decoration: underline;
    }
`

const SessionsList = styled.ul`
    width: 70%;
    margin: 0;
    list-style-type: none;
    border-radius: 4px;
    padding: 0 1rem;
    border: 1px solid ${p => p.theme["editor.hover.contents.codeblock.background"]};
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
                borderSize="4px"
                innerRef={this._button}
                isSelected={this.props.selected}
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
    sessions: SessionManager
    getActiveSection(): string
}

type ExecuteCommand = <T>(command: string, args?: T) => void

export interface IWelcomeInputEvent {
    vertical: number
    select: boolean
    horizontal?: number
}

interface ICommandMetadata<T = undefined> {
    command: string
    args?: T
}

export interface IWelcomeCommandsDictionary {
    openFile: ICommandMetadata
    openTutor: ICommandMetadata
    openDocs: ICommandMetadata
    openConfig: ICommandMetadata
    openThemes: ICommandMetadata
    openWorkspaceFolder: ICommandMetadata
    commandPalette: ICommandMetadata
    commandline: ICommandMetadata
}

export class WelcomeBufferLayer implements Oni.BufferLayer {
    public inputEvent = new Event<IWelcomeInputEvent>()

    public readonly welcomeCommands: IWelcomeCommandsDictionary = {
        openFile: { command: "oni.editor.newFile" },
        openWorkspaceFolder: { command: "workspace.openFolder" },
        commandPalette: { command: "quickOpen.show" },
        commandline: { command: "executeVimCommand" },
        openTutor: { command: "oni.tutor.open" },
        openDocs: { command: "oni.docs.open" },
        openConfig: { command: "oni.config.openUserConfig" },
        openThemes: { command: "oni.themes.open" },
    }

    constructor(private _oni: OniWithActiveSection) {}

    public get id() {
        return "oni.welcome"
    }

    public get friendlyName() {
        return "Welcome"
    }

    public isActive(): boolean {
        const activeSection = this._oni.getActiveSection()
        return activeSection === "editor"
    }

    public handleInput(key: string) {
        Log.info(`ONI WELCOME INPUT KEY: ${key}`)
        switch (key) {
            case "j":
                this.inputEvent.dispatch({ vertical: 1, select: false })
                break
            case "k":
                this.inputEvent.dispatch({ vertical: -1, select: false })
                break
            case "l":
                this.inputEvent.dispatch({ vertical: 0, select: false, horizontal: 1 })
                break
            case "h":
                this.inputEvent.dispatch({ vertical: 0, select: false, horizontal: -1 })
                break
            case "<enter>":
                this.inputEvent.dispatch({ vertical: 0, select: true })
                break
            default:
                this.inputEvent.dispatch({ vertical: 0, select: false })
        }
    }

    public executeCommand: ExecuteCommand = (cmd, args) => {
        if (cmd) {
            this._oni.commands.executeCommand(cmd, args)
        }
    }

    public restoreSession = async (name: string) => {
        await this._oni.sessions.restoreSession(name)
    }

    public render(context: Oni.BufferLayerRenderContext) {
        const active = this._oni.getActiveSection() === "editor"
        const commandIds = Object.values(this.welcomeCommands).map(({ command }) => command)
        const sessions = this._oni.sessions ? this._oni.sessions.allSessions : ([] as ISession[])
        const sessionIds = sessions.map(({ id }) => id)
        const ids = [...commandIds, ...sessionIds]
        const sections = [commandIds.length, sessionIds.length]

        return (
            <WelcomeWrapper>
                <WelcomeView
                    ids={ids}
                    active={active}
                    sections={sections}
                    sessions={sessions}
                    inputEvent={this.inputEvent}
                    commands={this.welcomeCommands}
                    restoreSession={this.restoreSession}
                    executeCommand={this.executeCommand}
                />
            </WelcomeWrapper>
        )
    }
}

export interface WelcomeViewProps {
    active: boolean
    sessions: ISession[]
    sections: number[]
    ids: string[]
    inputEvent: Event<IWelcomeInputEvent>
    commands: IWelcomeCommandsDictionary
    restoreSession: (name: string) => Promise<void>
    executeCommand: ExecuteCommand
}

export interface WelcomeViewState {
    version: string
    selectedId: string
    currentIndex: number
}

export class WelcomeView extends React.PureComponent<WelcomeViewProps, WelcomeViewState> {
    public state: WelcomeViewState = {
        version: null,
        currentIndex: 0,
        selectedId: this.props.ids[0],
    }

    private _welcomeElement = React.createRef<HTMLDivElement>()

    public async componentDidMount() {
        const metadata = await getMetadata()
        this.setState({ version: metadata.version })
        this.props.inputEvent.subscribe(this.handleInput)
    }

    public handleInput = async ({ vertical, select, horizontal }: IWelcomeInputEvent) => {
        const { currentIndex } = this.state
        const { sections, ids, executeCommand, active } = this.props

        const newIndex = this.getNextIndex(currentIndex, vertical, horizontal, sections)
        const selectedId = ids[newIndex]
        this.setState({ currentIndex: newIndex, selectedId })

        const selectedSession = this.props.sessions.find(session => session.id === selectedId)

        if (select && active) {
            if (selectedSession) {
                await this.props.restoreSession(selectedSession.name)
            } else {
                const currentCommand = this.getCurrentCommand(selectedId)
                executeCommand(currentCommand.command, currentCommand.args)
            }
        }
    }

    public getCurrentCommand(selectedId: string): ICommandMetadata {
        const { commands } = this.props
        const currentCommand = Object.values(commands).find(({ command }) => command === selectedId)
        return currentCommand
    }

    public getNextIndex(
        currentIndex: number,
        vertical: number,
        horizontal: number,
        sections: number[],
    ) {
        const nextPosition = currentIndex + vertical
        const numberOfItems = this.props.ids.length

        // TODO: this currently handles *TWO* sections if more sections are to be added will need
        // to rethink how to allow navigation across multiple sections
        switch (true) {
            case horizontal === 1:
                return sections[0]
            case horizontal === -1:
                return 0
            case nextPosition < 0:
                return numberOfItems - 1
            case nextPosition === numberOfItems:
                return 0
            default:
                return nextPosition
        }
    }

    public componentDidUpdate() {
        if (this.props.active && this._welcomeElement && this._welcomeElement.current) {
            this._welcomeElement.current.focus()
        }
    }

    public render() {
        const { version, selectedId } = this.state
        return version ? (
            <Column innerRef={this._welcomeElement} height="100%" data-id="welcome-screen">
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
                        <SubtitleText>{`v${version}`}</SubtitleText>
                        <div>{"https://onivim.io"}</div>
                    </Column>
                    <Column />
                </Row>
                <Row extension={boxStyling}>
                    <WelcomeCommandsView
                        commands={this.props.commands}
                        selectedId={selectedId}
                        executeCommand={this.props.executeCommand}
                    />
                    <RightColumn>
                        <SessionsList>
                            <SectionHeader>Sessions</SectionHeader>
                            {this.props.sessions.length ? (
                                this.props.sessions.map(session => (
                                    <SectionItem
                                        isSelected={session.id === selectedId}
                                        onClick={() => this.props.restoreSession(session.name)}
                                        key={session.id}
                                    >
                                        <Icon name="file" /> {session.name}
                                    </SectionItem>
                                ))
                            ) : (
                                <SectionItem>No Sessions Available</SectionItem>
                            )}
                        </SessionsList>
                    </RightColumn>
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
        const isSelected = (command: string) => command === this.props.selectedId
        return (
            <LeftColumn>
                <AnimatedContainer duration="0.25s">
                    <SectionHeader>Quick Commands</SectionHeader>
                    <WelcomeButton
                        title="New File"
                        onClick={() => executeCommand(commands.openFile.command)}
                        description="Control + N"
                        command={commands.openFile.command}
                        selected={isSelected(commands.openFile.command)}
                    />
                    <WelcomeButton
                        title="Open File / Folder"
                        onClick={() => executeCommand(commands.openWorkspaceFolder.command)}
                        description="Control + O"
                        command={commands.openWorkspaceFolder.command}
                        selected={isSelected(commands.openWorkspaceFolder.command)}
                    />
                    <WelcomeButton
                        title="Command Palette"
                        onClick={() => executeCommand(commands.commandPalette.command)}
                        description="Control + Shift + P"
                        command={commands.commandPalette.command}
                        selected={isSelected(commands.commandPalette.command)}
                    />
                    <WelcomeButton
                        title="Vim Ex Commands"
                        description=":"
                        command="editor.openExCommands"
                        onClick={() => executeCommand(commands.commandline.command)}
                        selected={isSelected(commands.commandline.command)}
                    />
                </AnimatedContainer>
                <AnimatedContainer duration="0.25s">
                    <SectionHeader>Learn</SectionHeader>
                    <WelcomeButton
                        title="Tutor"
                        onClick={() => executeCommand(commands.openTutor.command)}
                        description="Learn modal editing with an interactive tutorial."
                        command={commands.openTutor.command}
                        selected={isSelected(commands.openTutor.command)}
                    />
                    <WelcomeButton
                        title="Documentation"
                        onClick={() => executeCommand(commands.openDocs.command)}
                        description="Discover what Oni can do for you."
                        command={commands.openDocs.command}
                        selected={isSelected(commands.openDocs.command)}
                    />
                </AnimatedContainer>
                <AnimatedContainer duration="0.25s">
                    <SectionHeader>Customize</SectionHeader>
                    <WelcomeButton
                        title="Configure"
                        onClick={() => executeCommand(commands.openConfig.command)}
                        description="Make Oni work the way you want."
                        command={commands.openConfig.command}
                        selected={isSelected(commands.openConfig.command)}
                    />
                    <WelcomeButton
                        title="Themes"
                        onClick={() => executeCommand(commands.openThemes.command)}
                        description="Choose a theme that works for you."
                        command={commands.openThemes.command}
                        selected={isSelected(commands.openThemes.command)}
                    />
                </AnimatedContainer>
            </LeftColumn>
        )
    }
}
