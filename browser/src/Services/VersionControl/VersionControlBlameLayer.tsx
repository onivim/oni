import { Buffer, BufferLayer } from "oni-api"
import * as React from "react"

import { LayerContextWithCursor } from "../../Editor/NeovimEditor/NeovimBufferLayersView"
import styled, { boxShadow, pixel, withProps } from "../../UI/components/common"
import { VersionControlProvider } from "./"
import { Blame } from "./VersionControlProvider"

interface IProps extends LayerContextWithCursor {
    getBlame: (lineOne: number, lineTwo: number) => Promise<Blame>
    timeout: number
    currentLineNumber: number
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
    renderInline: boolean
}

const BlameContainer = withProps<IContainerProps>(styled.div).attrs({
    style: ({ height, top, left }: IContainerProps) => ({
        height: pixel(height),
        top: pixel(top),
        left: pixel(left),
    }),
})`
    position: absolute;
    margin-left: ${p => pixel(p.marginLeft)};
    width: ${p => (p.renderInline ? "auto" : "100%")};
    background-color: ${p => p.theme["menu.background"]};
    color: ${p => p.theme["menu.foreground"]};
    padding: 0.2em;
    font-style:italic;
    ${p => !p.renderInline && boxShadow};
`

const BlameDetails = styled.span`
    color: inherit;
    opacity: 0.8;
`

export class VCSBlame extends React.PureComponent<IProps, IState> {
    public state: IState = {
        blame: null,
        showBlame: null,
    }
    private _timeout: any
    private readonly LEFT_OFFSET = 15

    public async componentDidMount() {
        const { cursorLine: line } = this.props
        this.resetTimer()
        await this.updateBlame(line, line + 1)
    }

    public async componentDidUpdate(prevProps: IProps) {
        if (prevProps.cursorLine !== this.props.cursorLine) {
            const { currentLineNumber: line } = this.props
            this.resetTimer()
            await this.updateBlame(line, line + 1)
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
        const { cursorLine: bufferLine, currentLineNumber: screenLine } = this.props
        const previousBufferLine = bufferLine - 1
        const currentLine = this.props.visibleLines[screenLine]
        const character = currentLine && currentLine.length
        const positionToRender = this.canFit()
            ? { line: bufferLine, character }
            : { line: previousBufferLine, character: 0 }
        const position = this.props.bufferToPixel(positionToRender)

        return {
            top: position ? position.pixelY : null,
            left: position ? position.pixelX : null,
        }
    }

    public updateBlame = async (lineOne: number, lineTwo: number) => {
        const blame = await this.props.getBlame(lineOne, lineTwo)
        this.setState({ blame })
    }

    public formatCommitDate(timestamp: string) {
        return new Date(parseInt(timestamp, 10) * 1000)
    }

    public getBlameText = () => {
        const { blame } = this.state
        if (!blame) {
            return null
        }
        const { author, hash, committer_time } = blame
        const message = `${author}, ${hash.slice(0, 4)}, ${this.formatCommitDate(committer_time)}`
        return message
    }

    public canFit = () => {
        const { visibleLines, dimensions, currentLineNumber } = this.props
        const message = this.getBlameText()
        const currentLine = visibleLines[currentLineNumber] || ""
        const canFit = dimensions.width > currentLine.length + message.length + this.LEFT_OFFSET
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
                    marginLeft={this.LEFT_OFFSET}
                    height={this.props.fontPixelHeight}
                    renderInline={this.canFit()}
                    {...this.calculatePosition()}
                >
                    <BlameDetails>{this.getBlameText()}</BlameDetails>
                </BlameContainer>
            )
        )
    }
}

export default class VersionControlBlameLayer implements BufferLayer {
    constructor(private _buffer: Buffer, private _vcsProvider: VersionControlProvider) {}

    public getBlame = (lineOne: number, lineTwo: number) =>
        this._vcsProvider.getBlame({ file: this._buffer.filePath, lineOne, lineTwo })

    get id() {
        return "vcs.blame"
    }

    public render(context: LayerContextWithCursor) {
        const currentLineNumber = context.cursorLine + 1
        const visibleLineIndex = currentLineNumber - context.topBufferLine
        return (
            <VCSBlame
                {...context}
                timeout={1000}
                getBlame={this.getBlame}
                currentLineNumber={visibleLineIndex}
            />
        )
    }
}
