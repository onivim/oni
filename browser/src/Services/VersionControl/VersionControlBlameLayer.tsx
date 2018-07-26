import { BufferLayer, BufferLayerRenderContext, Buffer } from "oni-api"
import * as React from "react"

import { VersionControlProvider } from "./"
import styled, { boxShadow, pixel, withProps } from "../../UI/components/common"
import { Blame } from "./VersionControlProvider"

interface IProps extends BufferLayerRenderContext {
    getBlame: () => Promise<Blame>
}
interface IState {
    blame: Blame
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
    }
    public async componentDidMount() {
        const blame = await this.props.getBlame()
        this.setState({ blame })
    }

    public calculatePosition(line: number) {
        const { pixelX, pixelY } = this.props.bufferToPixel({ line, character: 0 })
        return {
            top: pixelY,
            left: pixelX,
        }
    }

    public render() {
        const { blame } = this.state
        return (
            blame && (
                <BlameContainer
                    data-id="vcs.blame"
                    height={this.props.fontPixelHeight}
                    {...this.calculatePosition(3)}
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

    public getBlame = () =>
        this._vcsProvider.getBlame({ file: this._buffer.filePath, lineOne: 1, lineTwo: 2 })

    get id() {
        return "vcs.blame"
    }

    public render(context: BufferLayerRenderContext) {
        return <VCSBlame {...context} getBlame={this.getBlame} />
    }
}
