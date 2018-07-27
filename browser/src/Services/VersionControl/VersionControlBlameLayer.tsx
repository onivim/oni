import { pathExists } from "fs-extra"
import { Buffer, BufferLayer, Commands, Configuration, Coordinates } from "oni-api"
import * as React from "react"
import Transition from "react-transition-group/Transition"

import { LayerContextWithCursor } from "../../Editor/NeovimEditor/NeovimBufferLayersView"
import styled, { boxShadow, css, pixel, withProps } from "../../UI/components/common"
import { getTimeSince } from "../../Utility"
import { VersionControlProvider } from "./"
import { Blame as IBlame } from "./VersionControlProvider"

type TransitionStates = "entering" | "entered"

interface ICanFit {
    canFit: boolean
    message: string
}

interface IProps extends LayerContextWithCursor {
    getBlame: (lineOne: number, lineTwo: number) => Promise<IBlame>
    timeout: number
    cursorScreenLine: number
    cursorBufferLine: number
    currentLine: string
    mode: "auto" | "manual"
    fontFamily: string
    setupCommand: (callback: () => void) => void
}
interface IState {
    blame: IBlame
    showBlame: boolean
    currentLineContent: string
    currentCursorBufferLine: number
}

interface IContainerProps {
    height: number
    top: number
    left: number
    marginLeft: number
    inline: boolean
    fontFamily: string
    animationState: TransitionStates
    timeout: number
}

const inlineStyles = css`
    ${(p: IContainerProps) => `
        height: ${pixel(p.height)};
        line-height: ${pixel(p.height)};
        margin-left: ${pixel(p.marginLeft)};
    `};
`

const hoverStyles = css`
    background-color: ${p => p.theme["editor.hover.contents.background"]};
    padding: 0.5em;
    ${boxShadow};
`

const getOpacity = (state: TransitionStates, inline: boolean) => {
    const transitionStyles = {
        entering: 0,
        entered: inline ? 0.5 : 1,
    }
    return transitionStyles[state]
}

const BlameContainer = withProps<IContainerProps>(styled.div).attrs({
    style: ({ top, left }: IContainerProps) => ({
        top: pixel(top),
        left: pixel(left),
    }),
})`
    width: auto;
    box-sizing: border-box;
    position: absolute;
    font-style: italic;
    font-family: ${p => p.fontFamily};
    color: ${p => p.theme["menu.foreground"]};
    transition: opacity ${p => p.timeout}ms ease-in-out;
    opacity: ${p => getOpacity(p.animationState, p.inline)};
    ${p => (p.inline ? inlineStyles : hoverStyles)};
`

const BlameDetails = styled.span`
    color: inherit;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

// CurrentLine - the string in the current line
// CursorLine - The 0 based position of the cursor in the file i.e. at line 30 this will be 29
// CursorBufferLine - The 1 based position of the cursor in the file i.e. at line 30 it will be 30
// CursorScreenLine - the position of the cursor within the visible lines so if line 30 is at the
// top of the viewport it will be 0
export class Blame extends React.PureComponent<IProps, IState> {
    public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
        // Reset show blame to false when props change - do it here so it happens before rendering
        // hide if the current line has changed or if the text of the line has changed
        // aka input is in progress or if there is an empty line
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
        blame: null,
        showBlame: null,
        currentCursorBufferLine: this.props.cursorBufferLine,
        currentLineContent: this.props.currentLine,
    }

    private _timeout: any
    private readonly DURATION = 100
    private readonly TOP_OFFSET = 20
    private readonly LEFT_OFFSET = 15

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

    public resetTimer = () => {
        clearTimeout(this._timeout)
        this._timeout = setTimeout(() => {
            this.setState({ showBlame: true })
        }, this.props.timeout)
    }

    public calculatePosition(canFit: boolean) {
        const { cursorLine, cursorScreenLine } = this.props
        const previousBufferLine = cursorLine - 1
        const currentLine = this.props.visibleLines[cursorScreenLine]
        const character = currentLine && currentLine.length

        const positionToRender = canFit
            ? { line: cursorLine, character }
            : { line: previousBufferLine, character: 0 }
        const position = this.props.bufferToPixel(positionToRender)

        return this.getPosition(position, canFit)
    }

    public updateBlame = async (lineOne: number, lineTwo: number) => {
        const outOfBounds = this.isOutOfBounds(lineOne, lineTwo)
        const blame = !outOfBounds ? await this.props.getBlame(lineOne, lineTwo) : null
        this.setState({ blame })
    }

    public formatCommitDate(timestamp: string) {
        return new Date(parseInt(timestamp, 10) * 1000)
    }

    public getPosition(position: Coordinates.PixelSpacePoint, canFit: boolean) {
        if (!position) {
            return {
                top: null,
                left: null,
            }
        }

        // if cannot fit reduce the top position aka raise the tooltip up
        const top = canFit ? position.pixelY : !canFit ? position.pixelY - this.TOP_OFFSET : null
        return {
            top,
            left: position ? position.pixelX : null,
        }
    }

    public isOutOfBounds = (...lines: number[]) => {
        return lines.some(
            line => !line || line > this.props.bottomBufferLine || line < this.props.topBufferLine,
        )
    }

    public getBlameText = (truncationAmount = 0) => {
        const { blame } = this.state
        if (!blame) {
            return null
        }
        const { author, hash, committer_time } = blame
        const formattedDate = this.formatCommitDate(committer_time)
        const timeSince = getTimeSince(formattedDate)
        const formattedHash = hash.slice(0, 4).toUpperCase()

        const words = blame.summary.split(" ")
        const shortened = words.slice(0, words.length - truncationAmount).join(" ")
        const formattedSummary =
            truncationAmount && shortened.length ? shortened + "..." : shortened

        const message = !shortened.length
            ? `${author}, ${timeSince}`
            : `${author}, ${timeSince} ago, ${formattedSummary} #${formattedHash}`
        return message
    }

    // Recursively calls get blame text if the message will not fit onto the screen up
    // to a limit of 6 times each time removing one word from the blame message
    // if after 6 attempts the message is still not small enougth then we render the popup
    public canFit = (truncationAmount = 0): ICanFit => {
        const { visibleLines, dimensions, cursorScreenLine, fontPixelWidth } = this.props
        const offset = Math.round(this.LEFT_OFFSET / fontPixelWidth)
        const message = this.getBlameText(truncationAmount)
        const currentLine = visibleLines[cursorScreenLine] || ""
        const canFit = dimensions.width > currentLine.length + message.length + offset
        if (!canFit && truncationAmount <= 6) {
            return this.canFit(truncationAmount + 1)
        }
        return {
            canFit,
            message: !canFit ? this.getBlameText() : message,
        }
    }

    public componentWillUnmount() {
        clearTimeout(this._timeout)
    }

    public render() {
        const { blame, showBlame } = this.state
        if (!blame || !showBlame) {
            return null
        }
        const { message, canFit } = this.canFit()
        return (
            <Transition in={blame && showBlame} timeout={this.DURATION}>
                {(state: TransitionStates) => (
                    <BlameContainer
                        data-id="vcs.blame"
                        timeout={this.DURATION}
                        inline={canFit}
                        animationState={state}
                        marginLeft={this.LEFT_OFFSET}
                        height={this.props.fontPixelHeight}
                        fontFamily={this.props.fontFamily}
                        {...this.calculatePosition(canFit)}
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
