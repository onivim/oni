import { Buffer, BufferLayer } from "oni-api"
import * as React from "react"

import { LayerContextWithCursor } from "../../Editor/NeovimEditor/NeovimBufferLayersView"
import styled, { boxShadow, pixel, withProps } from "../../UI/components/common"
import { VersionControlProvider } from "./"
import { Blame } from "./VersionControlProvider"

interface IProps extends LayerContextWithCursor {
    getBlame: (lineOne: number, lineTwo: number) => Promise<Blame>
    timeout: number
}
interface IState {
    blame: Blame
    showBlame: boolean
}

interface IContainerProps {
    height: number
    top: number
    left: number
}

const BlameContainer = withProps<IContainerProps>(styled.div).attrs({
    style: ({ height, top, left }: IContainerProps) => ({
        height: pixel(height),
        top: pixel(top),
        left: pixel(left),
    }),
})`
    position: absolute;
    width: 100%;
    background-color: ${p => p.theme["menu.background"]};
    color: ${p => p.theme["menu.foreground"]};
    display: flex;
    justify-content: space-around;
    padding: 0.2em;
    ${boxShadow};
`

const BlameDetails = styled.span`
    color: inherit;
`

export class VCSBlame extends React.PureComponent<IProps, IState> {
    public state: IState = {
        blame: null,
        showBlame: null,
    }
    private _timeout: any

    public async componentDidMount() {
        const { cursorLine: line } = this.props
        await this.updateBlame(line, line + 1)
    }

    public async componentDidUpdate(prevProps: IProps) {
        if (prevProps.cursorLine !== this.props.cursorLine) {
            const { cursorLine: line } = this.props
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

    public calculatePosition(line: number) {
        const previousLine = line - 1
        const position = this.props.bufferToPixel({ line: previousLine, character: 0 })
        return {
            top: position ? position.pixelY : null,
            left: position ? position.pixelX : null,
        }
    }

    public updateBlame = async (lineOne: number, lineTwo: number) => {
        const blame = await this.props.getBlame(lineOne, lineTwo)
        this.setState({ blame })
    }

    public render() {
        const { blame, showBlame } = this.state
        const { cursorLine: line } = this.props
        return (
            blame &&
            showBlame && (
                <BlameContainer
                    data-id="vcs.blame"
                    height={this.props.fontPixelHeight}
                    {...this.calculatePosition(line)}
                >
                    <BlameDetails>{blame.author}</BlameDetails>
                    <BlameDetails>{blame.hash}</BlameDetails>
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
        return <VCSBlame {...context} getBlame={this.getBlame} timeout={1000} />
    }
}
