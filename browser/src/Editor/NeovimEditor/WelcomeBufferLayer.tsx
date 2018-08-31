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
    direction: rtl;
    &:hover {
        overflow-y: overlay;
    }
    & > * {
        direction: ltr;
    }
`

const LeftColumn = styled.div`
    ${sectionStyles};
    padding: 0;
    padding-left: 1rem;
    overflow-y: hidden;
    width: 60%;
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

export const SectionHeader = styled.div`
    margin-top: 1em;
    margin-bottom: 1em;
    font-size: 1.2em;
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
    margin: 0.8em 0;
    padding: 0.8em;
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
    font-size: 1em;
    font-weight: bold;
    margin: 0.4em;
    width: 100%;
    text-align: left;
`

const WelcomeButtonDescription = styled.span`
    font-size: 0.8em;
    opacity: 0.75;
    margin: 4px;
    width: 100%;
    text-align: right;
`

const boxStyling = css`
    width: 60%;
    height: 60%;
    padding: 0 1em;
    opacity: 1;
    margin-top: 64px;
    box-sizing: border-box;
    border: 1px solid ${p => p.theme["editor.hover.contents.background"]};
    border-radius: 4px;
    overflow: hidden;
    justify-content: space-around;
    background-color: ${p => p.theme["editor.hover.contents.codeblock.background"]};
    ${boxShadowInset};
`

const titleRow = css`
    width: 100%;
    padding-top: 32px;
    animation: ${entranceFull} 0.25s ease-in 0.25s forwards};
`

const selectedSectionItem = css`
    ${({ theme }) => `
        text-decoration: underline;
        color: ${theme["highlight.mode.normal.background"]};
    `};
`

export const SectionItem = styled<{ isSelected?: boolean }, "li">("li")`
    width: 100%;
    margin: 0.2em;
    text-align: left;
    height: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${({ isSelected }) => isSelected && selectedSectionItem};

    &:hover {
        text-decoration: underline;
    }
`

export const SessionsList = styled.ul`
    width: 70%;
    margin: 0;
    list-style-type: none;
    border-radius: 4px;
    padding: 0 1em;
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
    select: boolean
    vertical: number
    horizontal?: number
}

interface ICommandMetadata {
    execute: <T = undefined>(args?: T) => void
    command: string
}

export interface IWelcomeCommandsDictionary {
    openFile: ICommandMetadata
    openTutor: ICommandMetadata
    openDocs: ICommandMetadata
    openConfig: ICommandMetadata
    openThemes: ICommandMetadata
    openWorkspaceFolder: ICommandMetadata
    quickOpenShow: ICommandMetadata
    commandline: ICommandMetadata
    restoreSession: (sessionName: string) => Promise<void>
}

export class WelcomeBufferLayer implements Oni.BufferLayer {
    public inputEvent = new Event<IWelcomeInputEvent>()

    public showCommandline = async () => {
        const remapping: string = await this._oni.editors.activeEditor.neovim.callFunction(
            "mapcheck",
            [":", "n"],
        )
        const mapping = remapping || ":"
        this._oni.automation.sendKeys(mapping)
    }

    public executeCommand: ExecuteCommand = (cmd, args) => {
        this._oni.commands.executeCommand(cmd, args)
    }

    public restoreSession = async (name: string) => {
        await this._oni.sessions.restoreSession(name)
    }

    public readonly welcomeCommands: IWelcomeCommandsDictionary = {
        openFile: {
            execute: args => this.executeCommand("oni.editor.newFile", args),
            command: "oni.editor.newFile",
        },
        openWorkspaceFolder: {
            execute: args => this.executeCommand("workspace.openFolder", args),
            command: "workspace.openFolder",
        },
        quickOpenShow: {
            execute: args => this.executeCommand("quickOpen.show", args),
            command: "quickOpen.show",
        },
        commandline: {
            execute: this.showCommandline,
            command: "editor.executeVimCommand",
        },
        openTutor: {
            execute: args => this.executeCommand("oni.tutor.open", args),
            command: "oni.tutor.open",
        },
        openDocs: {
            execute: args => this.executeCommand("oni.docs.open", args),
            command: "oni.docs.open",
        },
        openConfig: {
            execute: args => this.executeCommand("oni.config.openUserConfig", args),
            command: "oni.config.openUserConfig",
        },
        openThemes: {
            execute: args => this.executeCommand("oni.themes.choose", args),
            command: "oni.themes.open",
        },
        restoreSession: args => this.restoreSession(args),
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

    public getProps() {
        const active = this._oni.getActiveSection() === "editor"
        const commandIds = Object.values(this.welcomeCommands)
            .map(({ command }) => command)
            .filter(Boolean)

        const sessions = this._oni.sessions ? this._oni.sessions.allSessions : ([] as ISession[])
        const sessionIds = sessions.map(({ id }) => id)
        const ids = [...commandIds, ...sessionIds]
        const sections = [commandIds.length, sessionIds.length].filter(Boolean)

        return { active, ids, sections, sessions }
    }

    public render(context: Oni.BufferLayerRenderContext) {
        const props = this.getProps()
        return (
            <WelcomeWrapper>
                <WelcomeView
                    {...props}
                    getMetadata={getMetadata}
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
    getMetadata: () => Promise<{ version: string }>
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
        const metadata = await this.props.getMetadata()
        this.setState({ version: metadata.version })
        this.props.inputEvent.subscribe(this.handleInput)
    }

    public handleInput = async ({ vertical, select, horizontal }: IWelcomeInputEvent) => {
        const { currentIndex } = this.state
        const { sections, ids, active } = this.props

        const newIndex = this.getNextIndex(currentIndex, vertical, horizontal, sections)
        const selectedId = ids[newIndex]
        this.setState({ currentIndex: newIndex, selectedId })

        const selectedSession = this.props.sessions.find(session => session.id === selectedId)

        if (select && active) {
            if (selectedSession) {
                await this.props.commands.restoreSession(selectedSession.name)
            } else {
                const currentCommand = this.getCurrentCommand(selectedId)
                currentCommand.execute()
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
        const multipleSections = sections.length > 1

        // TODO: this currently handles *TWO* sections if more sections
        // are to be added will need to rethink how to allow navigation across multiple sections
        switch (true) {
            case multipleSections && horizontal === 1:
                return sections[0]
            case multipleSections && horizontal === -1:
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
        return (
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
                        {version && <SubtitleText>{`v${version}`}</SubtitleText>}
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
                                        <Icon name="file" style={{ marginRight: "0.3em" }} />{" "}
                                        {session.name}
                                    </SectionItem>
                                ))
                            ) : (
                                <SectionItem>No Sessions Available</SectionItem>
                            )}
                        </SessionsList>
                    </RightColumn>
                </Row>
            </Column>
        )
    }
}

export interface IWelcomeCommandsViewProps extends Partial<WelcomeViewProps> {
    selectedId: string
}

export class WelcomeCommandsView extends React.PureComponent<IWelcomeCommandsViewProps, {}> {
    public isSelected = (command: string) => command === this.props.selectedId
    public render() {
        const { commands } = this.props
        return (
            <LeftColumn>
                <AnimatedContainer duration="0.25s">
                    <SectionHeader>Quick Commands</SectionHeader>
                    <WelcomeButton
                        title="New File"
                        onClick={() => this.props.commands.openFile.execute()}
                        description="Control + N"
                        command={commands.openFile.command}
                        selected={this.isSelected(commands.openFile.command)}
                    />
                    <WelcomeButton
                        title="Open File / Folder"
                        description="Control + O"
                        onClick={() => this.props.commands.openWorkspaceFolder.execute()}
                        command={commands.openWorkspaceFolder.command}
                        selected={this.isSelected(commands.openWorkspaceFolder.command)}
                    />
                    <WelcomeButton
                        title="Command Palette"
                        onClick={() => this.props.commands.quickOpenShow.execute()}
                        description="Control + Shift + P"
                        command={commands.quickOpenShow.command}
                        selected={this.isSelected(commands.quickOpenShow.command)}
                    />
                    <WelcomeButton
                        title="Vim Ex Commands"
                        description=":"
                        command="editor.openExCommands"
                        onClick={() => this.props.commands.commandline.execute()}
                        selected={this.isSelected(commands.commandline.command)}
                    />
                </AnimatedContainer>
                <AnimatedContainer duration="0.25s">
                    <SectionHeader>Learn</SectionHeader>
                    <WelcomeButton
                        title="Tutor"
                        onClick={() => commands.openTutor.execute()}
                        description="Learn modal editing with an interactive tutorial."
                        command={commands.openTutor.command}
                        selected={this.isSelected(commands.openTutor.command)}
                    />
                    <WelcomeButton
                        title="Documentation"
                        onClick={() => commands.openDocs.execute()}
                        description="Discover what Oni can do for you."
                        command={commands.openDocs.command}
                        selected={this.isSelected(commands.openDocs.command)}
                    />
                </AnimatedContainer>
                <AnimatedContainer duration="0.25s">
                    <SectionHeader>Customize</SectionHeader>
                    <WelcomeButton
                        title="Configure"
                        onClick={() => commands.openConfig.execute}
                        description="Make Oni work the way you want."
                        command={commands.openConfig.command}
                        selected={this.isSelected(commands.openConfig.command)}
                    />
                    <WelcomeButton
                        title="Themes"
                        onClick={() => commands.openThemes.execute()}
                        description="Choose a theme that works for you."
                        command={commands.openThemes.command}
                        selected={this.isSelected(commands.openThemes.command)}
                    />
                </AnimatedContainer>
            </LeftColumn>
        )
    }
}
