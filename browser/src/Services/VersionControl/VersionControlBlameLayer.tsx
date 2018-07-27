import { pathExists } from "fs-extra"
import { Buffer, BufferLayer, Commands, Configuration } from "oni-api"
import * as React from "react"

import { LayerContextWithCursor } from "../../Editor/NeovimEditor/NeovimBufferLayersView"
import styled, { boxShadow, css, darken, pixel, withProps } from "../../UI/components/common"
import { getTimeSince } from "../../Utility"
import { VersionControlProvider } from "./"
import { Blame } from "./VersionControlProvider"

interface IProps extends LayerContextWithCursor {
    getBlame: (lineOne: number, lineTwo: number) => Promise<Blame>
    timeout: number
    cursorScreenLine: number
    cursorBufferLine: number
    mode: "auto" | "manual"
    setupCommand: (callback: () => void) => void
}
interface IState {
    blame: Blame
    showBlame: boolean
}

interface IContainerProps {
    height: number
    top: number
    left: number
    marginLeft: number
    inline: boolean
}

const inlineStyles = css`
    ${(p: IContainerProps) => `
        height: ${pixel(p.height)};
        line-height: ${pixel(p.height)};
        margin-left: ${pixel(p.marginLeft)};
        opacity: 0.5;
    `};
`

const hoverStyles = css`
    background-color: ${p => p.theme["editor.hover.contents.background"]};
    padding: 0.5em;
    ${boxShadow};
`

const BlameContainer = withProps<IContainerProps>(styled.div).attrs({
    style: ({ height, top, left }: IContainerProps) => ({
        top: pixel(top),
        left: pixel(left),
    }),
})`
    box-sizing: border-box;
    position: absolute;
    width: auto;
    font-style: italic;
    color: ${p => darken(p.theme["menu.foreground"])};
    ${p => (p.inline ? inlineStyles : hoverStyles)};
`

const BlameDetails = styled.span`
    color: inherit;
    opacity: 0.8;
`

// CursorLine is the 0 based position of the cursor in the file i.e. at line 30 this will be 29
// CursorBufferLine is the 1 based position of the cursor in the file i.e. at line 30 it will be 30
// CursorScreenLine the position of the cursor within the visible lines so if line 30 is at the
// top of the viewport it will be 0
export class VCSBlame extends React.PureComponent<IProps, IState> {
    public state: IState = {
        blame: null,
        showBlame: null,
    }
    private _timeout: any
    private readonly LEFT_OFFSET = 15

    public async componentDidMount() {
        const { cursorBufferLine, mode } = this.props
        await this.updateBlame(cursorBufferLine, cursorBufferLine + 1)
        if (mode === "auto") {
            this.resetTimer()
        }
        this.props.setupCommand(() => {
            const { showBlame } = this.state
            this.setState({ showBlame: !showBlame })
        })
    }

    public async componentDidUpdate(prevProps: IProps) {
        const { cursorBufferLine, mode } = this.props
        if (prevProps.cursorBufferLine !== cursorBufferLine) {
            await this.updateBlame(cursorBufferLine, cursorBufferLine + 1)
            if (mode === "auto") {
                return this.resetTimer()
            }
            this.setState({ showBlame: false })
        }
    }

    public resetTimer = () => {
        clearTimeout(this._timeout)
        this.setState({ showBlame: false })
        this._timeout = setTimeout(() => {
            this.setState({ showBlame: true })
        }, this.props.timeout)
    }

    public calculatePosition() {
        const { cursorLine, cursorScreenLine } = this.props
        const previousBufferLine = cursorLine - 1
        const currentLine = this.props.visibleLines[cursorScreenLine]
        const character = currentLine && currentLine.length
        const canFit = this.canFit()
        const positionToRender = canFit
            ? { line: cursorLine, character }
            : { line: previousBufferLine, character: 0 }
        const position = this.props.bufferToPixel(positionToRender)

        return {
            top: position && canFit ? position.pixelY : !canFit ? position.pixelY - 15 : null,
            left: position ? position.pixelX : null,
        }
    }

    public updateBlame = async (lineOne: number, lineTwo: number) => {
        const outOfBounds = this.isOutOfBounds(lineOne, lineTwo)
        const blame = !outOfBounds ? await this.props.getBlame(lineOne, lineTwo) : null
        this.setState({ blame })
    }

    public formatCommitDate(timestamp: string) {
        return new Date(parseInt(timestamp, 10) * 1000)
    }

    public isOutOfBounds = (...lines: number[]) => {
        return lines.some(
            line => !line || line > this.props.bottomBufferLine || line < this.props.topBufferLine,
        )
    }

    public getBlameText = () => {
        const { blame } = this.state
        if (!blame) {
            return null
        }
        const { author, hash, committer_time } = blame
        const formattedDate = this.formatCommitDate(committer_time)
        const timeSince = getTimeSince(formattedDate)
        const formattedHash = hash.slice(0, 4).toUpperCase()
        const message = `${author}, ${timeSince} ago, ${blame.summary} #${formattedHash}`
        return message
    }

    public canFit = () => {
        const { visibleLines, dimensions, cursorScreenLine, fontPixelWidth } = this.props
        const offset = Math.round(this.LEFT_OFFSET / fontPixelWidth)
        const message = this.getBlameText()
        const currentLine = visibleLines[cursorScreenLine] || ""
        const canFit = dimensions.width > currentLine.length + message.length + offset
        return canFit
    }

    public componentWillUnmount() {
        clearTimeout(this._timeout)
    }

    public render() {
        const { blame, showBlame } = this.state
        return (
            blame &&
            showBlame && (
                <BlameContainer
                    data-id="vcs.blame"
                    inline={this.canFit()}
                    marginLeft={this.LEFT_OFFSET}
                    height={this.props.fontPixelHeight}
                    {...this.calculatePosition()}
                >
                    <BlameDetails>{this.getBlameText()}</BlameDetails>
                </BlameContainer>
            )
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
            enabled: () => true,
            execute: callback,
        })
    }

    public getConfigOpts() {
        const activated = this._configuration.getValue<boolean>("experimental.vcs.blame.enabled")
        const timeout = this._configuration.getValue<number>("experimental.vcs.blame.timeout")
        const mode = this._configuration.getValue<"auto" | "manual">("experimental.vcs.blame.mode")

        return { timeout, activated, mode }
    }

    public render(context: LayerContextWithCursor) {
        const cursorBufferLine = context.cursorLine + 1
        const cursorScreenLine = cursorBufferLine - context.topBufferLine
        const config = this.getConfigOpts()
        const activated = this._isActive() && config.activated
        return (
            activated && (
                <VCSBlame
                    {...context}
                    mode={config.mode}
                    timeout={config.timeout}
                    getBlame={this.getBlame}
                    setupCommand={this.setupCommand}
                    cursorBufferLine={cursorBufferLine}
                    cursorScreenLine={cursorScreenLine}
                />
            )
        )
    }

    private _isActive() {
        return this._vcsProvider && this._vcsProvider.isActivated
    }
}
