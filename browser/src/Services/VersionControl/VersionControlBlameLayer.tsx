import { pathExists } from "fs-extra"
import { Buffer, BufferLayer, Commands, Configuration } from "oni-api"
import { warn } from "oni-core-logging"
import * as React from "react"
import { Transition } from "react-transition-group"
import { Position } from "vscode-languageserver-types"

import { LayerContextWithCursor } from "../../Editor/NeovimEditor/NeovimBufferLayersView"
import styled, { pixel, textOverflow, withProps } from "../../UI/components/common"
import { getTimeSince } from "../../Utility"
import { VersionControlProvider } from "./"
import { Blame as IBlame } from "./VersionControlProvider"

type TransitionStates = "entering" | "entered" | "exiting"

interface IBlamePosition {
    top: number
    left: number
    hide: boolean
}

interface ICanFit {
    canFit: boolean
    message: string
    position: IBlamePosition
}

interface ILineDetails {
    nextSpacing: number
    lastEmptyLine: number
}

export interface IProps extends LayerContextWithCursor {
    getBlame: (lineOne: number, lineTwo: number) => Promise<IBlame>
    timeout: number
    cursorScreenLine: number
    cursorBufferLine: number
    currentLine: string
    mode: "auto" | "manual"
    fontFamily: string
    setupCommand: (callback: () => void) => void
}

export interface IState {
    blame: IBlame
    showBlame: boolean
    currentLineContent: string
    currentCursorBufferLine: number
    error: Error
}

interface IContainerProps {
    height: number
    top: number
    left: number
    fontFamily: string
    hide: boolean
    timeout: number
    animationState: TransitionStates
}

const getOpacity = (state: TransitionStates) => {
    const transitionStyles = {
        entering: 0,
        entered: 0.5,
        exiting: 0,
    }
    return transitionStyles[state]
}

export const BlameContainer = withProps<IContainerProps>(styled.div).attrs({
    style: ({ top, left }: IContainerProps) => ({
        top: pixel(top),
        left: pixel(left),
    }),
})`
    ${p => p.hide && `visibility: hidden`};
    width: auto;
    box-sizing: border-box;
    position: absolute;
    font-style: italic;
    font-family: ${p => p.fontFamily};
    color: ${p => p.theme["menu.foreground"]};
    opacity: ${p => getOpacity(p.animationState)};
    transition: opacity ${p => p.timeout}ms ease-in-out;
    height: ${p => pixel(p.height)};
    line-height: ${p => pixel(p.height)};
    right: 3em;
    ${textOverflow}
`

const BlameDetails = styled.span`
    color: inherit;
    width: 100%;
`

// CurrentLine - the string in the current line
// CursorLine - The 0 based position of the cursor in the file i.e. at line 30 this will be 29
// CursorBufferLine - The 1 based position of the cursor in the file i.e. at line 30 it will be 30
// CursorScreenLine - the position of the cursor within the visible lines so if line 30 is at the
// top of the viewport it will be 0

export class Blame extends React.PureComponent<IProps, IState> {
    // Reset show blame to false when props change - do it here so it happens before rendering
    // hide if the current line has changed or if the text of the line has changed
    // aka input is in progress or if there is an empty line
    public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
        const lineNumberChanged = nextProps.cursorBufferLine !== prevState.currentCursorBufferLine
        const lineContentChanged = prevState.currentLineContent !== nextProps.currentLine
        if (
            (prevState.showBlame && (lineNumberChanged || lineContentChanged)) ||
            !nextProps.currentLine
        ) {
            return {
                showBlame: false,
                blame: prevState.blame,
                currentLineContent: nextProps.currentLine,
                currentCursorBufferLine: nextProps.cursorBufferLine,
            }
        }
        return null
    }

    public state: IState = {
        error: null,
        blame: null,
        showBlame: null,
        currentLineContent: this.props.currentLine,
        currentCursorBufferLine: this.props.cursorBufferLine,
    }

    private _timeout: any
    private readonly DURATION = 300
    private readonly LEFT_OFFSET = 4

    public async componentDidMount() {
        const { cursorBufferLine, mode } = this.props
        await this.updateBlame(cursorBufferLine, cursorBufferLine)
        if (mode === "auto") {
            this.resetTimer()
        }
        this.props.setupCommand(() => {
            const { showBlame } = this.state
            this.setState({ showBlame: !showBlame })
        })
    }

    public async componentDidUpdate(prevProps: IProps, prevState: IState) {
        const { cursorBufferLine, currentLine, mode } = this.props
        if (prevProps.cursorBufferLine !== cursorBufferLine && currentLine) {
            await this.updateBlame(cursorBufferLine, cursorBufferLine)
            if (mode === "auto") {
                return this.resetTimer()
            }
        }
    }

    public componentWillUnmount() {
        clearTimeout(this._timeout)
    }

    public componentDidCatch(error: Error) {
        warn(`Oni VCS Blame layer failed because: ${error.message}`)
        this.setState({ error })
    }

    public resetTimer = () => {
        clearTimeout(this._timeout)
        const lastLinePosition = this.state.currentCursorBufferLine
        this._timeout = setTimeout(() => {
            if (this.state.currentCursorBufferLine === lastLinePosition) {
                this.setState({ showBlame: true })
            }
        }, this.props.timeout)
    }

    public getLastEmptyLine() {
        const { cursorLine, visibleLines, topBufferLine } = this.props
        const lineDetails: ILineDetails = {
            lastEmptyLine: null,
            nextSpacing: null,
        }
        for (
            let currentBufferLine = cursorLine;
            currentBufferLine >= topBufferLine;
            currentBufferLine--
        ) {
            const screenLine = currentBufferLine - topBufferLine
            const line = visibleLines[screenLine]
            if (!line.length) {
                const nextLine = visibleLines[screenLine + 1]
                lineDetails.lastEmptyLine = currentBufferLine
                // search for index of first non-whitespace character which is equivalent
                // to the whitespace count
                lineDetails.nextSpacing = nextLine.search(/\S/)
                break
            }
        }
        return lineDetails
    }

    public calculatePosition(canFit: boolean) {
        const { cursorLine, cursorScreenLine, visibleLines } = this.props
        const currentLine = visibleLines[cursorScreenLine]
        const character = currentLine && currentLine.length + this.LEFT_OFFSET

        if (canFit) {
            return this.getPosition({ line: cursorLine, character })
        }

        const { lastEmptyLine, nextSpacing } = this.getLastEmptyLine()

        if (lastEmptyLine) {
            return this.getPosition({ line: lastEmptyLine - 1, character: nextSpacing })
        }

        return this.getPosition()
    }

    // TODO: possibly add a caching strategy so a new call isn't made each time or
    // get a blame for the entire file and store it
    public updateBlame = async (lineOne: number, lineTwo: number) => {
        const outOfBounds = this.isOutOfBounds(lineOne, lineTwo)
        const blame = !outOfBounds ? await this.props.getBlame(lineOne, lineTwo) : null
        this.setState({ blame })
    }

    public formatCommitDate(timestamp: string) {
        return new Date(parseInt(timestamp, 10) * 1000)
    }

    public getPosition(positionToRender?: Position): IBlamePosition {
        const emptyPosition: IBlamePosition = {
            hide: true,
            top: null,
            left: null,
        }
        if (!positionToRender) {
            return emptyPosition
        }
        const position = this.props.bufferToPixel(positionToRender)
        if (!position) {
            return emptyPosition
        }
        return {
            hide: false,
            top: position.pixelY,
            left: position.pixelX,
        }
    }

    public isOutOfBounds = (...lines: number[]) => {
        return lines.some(
            line => !line || line > this.props.bottomBufferLine || line < this.props.topBufferLine,
        )
    }

    public getBlameText = (numberOfTruncations = 0) => {
        const { blame } = this.state
        if (!blame) {
            return null
        }
        const { author, hash, committer_time } = blame
        const formattedDate = this.formatCommitDate(committer_time)
        const timeSince = `${getTimeSince(formattedDate)} ago`
        const formattedHash = hash.slice(0, 4).toUpperCase()

        const words = blame.summary.split(" ")
        const message = words.slice(0, words.length - numberOfTruncations).join(" ")

        const symbol = "…"
        const summary = numberOfTruncations && words.length > 2 ? message.concat(symbol) : message

        return words.length < 2
            ? `${author}, ${timeSince}`
            : `${author}, ${timeSince}, ${summary} #${formattedHash}`
    }

    // Recursively calls get blame text if the message will not fit onto the screen up
    // to a limit of 6 times each time removing one word from the blame message
    // if after 6 attempts the message is still not small enougth then we render the popup
    public canFit = (truncationAmount = 0): ICanFit => {
        const { visibleLines, dimensions, cursorScreenLine } = this.props
        const message = this.getBlameText(truncationAmount)
        const currentLine = visibleLines[cursorScreenLine] || ""
        const canFit = dimensions.width > currentLine.length + message.length + this.LEFT_OFFSET

        if (!canFit && truncationAmount <= 6) {
            return this.canFit(truncationAmount + 1)
        }
        const truncatedOrFullMessage = canFit ? message : this.getBlameText()
        return {
            canFit,
            message: truncatedOrFullMessage,
            position: this.calculatePosition(canFit),
        }
    }

    public render() {
        const { blame, showBlame, error } = this.state
        if (!blame || !showBlame || error) {
            return null
        }
        const { message, position } = this.canFit()
        return (
            <Transition in={blame && showBlame} timeout={this.DURATION}>
                {(state: TransitionStates) => (
                    <BlameContainer
                        {...position}
                        data-id="vcs.blame"
                        timeout={this.DURATION}
                        animationState={state}
                        height={this.props.fontPixelHeight}
                        fontFamily={this.props.fontFamily}
                    >
                        <BlameDetails>{message}</BlameDetails>
                    </BlameContainer>
                )}
            </Transition>
        )
    }
}

export default class VersionControlBlameLayer implements BufferLayer {
    constructor(
        private _buffer: Buffer,
        private _vcsProvider: VersionControlProvider,
        private _configuration: Configuration,
        private _commands: Commands.Api,
    ) {}

    public getBlame = async (lineOne: number, lineTwo: number) => {
        const fileExists = await pathExists(this._buffer.filePath)
        return (
            fileExists &&
            this._vcsProvider.getBlame({ file: this._buffer.filePath, lineOne, lineTwo })
        )
    }

    get id() {
        return "vcs.blame"
    }

    public setupCommand = (callback: () => void) => {
        this._commands.registerCommand({
            command: "experimental.vcs.blame.toggleBlame",
            name: null,
            detail: null,
            enabled: this._isActive,
            execute: callback,
        })
    }

    public getConfigOpts() {
        const fontFamily = this._configuration.getValue<string>("editor.fontFamily")
        const timeout = this._configuration.getValue<number>("experimental.vcs.blame.timeout")
        const mode = this._configuration.getValue<"auto" | "manual">("experimental.vcs.blame.mode")

        return { timeout, mode, fontFamily }
    }

    public render(context: LayerContextWithCursor) {
        const cursorBufferLine = context.cursorLine + 1
        const cursorScreenLine = cursorBufferLine - context.topBufferLine
        const config = this.getConfigOpts()
        const activated = this._isActive()
        return (
            activated && (
                <Blame
                    {...context}
                    mode={config.mode}
                    timeout={config.timeout}
                    getBlame={this.getBlame}
                    fontFamily={config.fontFamily}
                    setupCommand={this.setupCommand}
                    cursorBufferLine={cursorBufferLine}
                    cursorScreenLine={cursorScreenLine}
                    currentLine={context.visibleLines[cursorScreenLine]}
                />
            )
        )
    }

    private _isActive() {
        return this._vcsProvider && this._vcsProvider.isActivated
    }
}
