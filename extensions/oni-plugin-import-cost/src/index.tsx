import * as Oni from "oni-api"
import * as path from "path"
import * as React from "react"
import styled, { ThemedStyledFunction } from "styled-components"
import { importCost, cleanup, JAVASCRIPT, TYPESCRIPT } from "import-cost"

interface PackageProps {
    left: number
    top: number
    width: number
    hide: boolean
}

interface IPackage {
    name: string
    size: number
    gzip: number
    line: number
}

const px = (s: string | number) => `${s}px`

export type StyledFunction<T> = ThemedStyledFunction<T, {}>

export function withProps<T, U extends HTMLElement = HTMLElement>(
    styledFunction: StyledFunction<React.HTMLProps<U>>,
): StyledFunction<T & React.HTMLProps<U>> {
    return styledFunction
}

const Gzip = styled.span`
    color: green;
`

const Package = withProps<PackageProps>(styled.div).attrs({
    style: (props: PackageProps) => ({
        left: px(props.left),
        top: px(props.top),
        width: px(props.width),
        visibility: props.hide ? "hidden" : "visible",
    }),
})`
    color: white;
    padding-left: 5px;
    position: absolute;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`

const Packages = styled.div`
    position: relative;
`

interface Props {
    buffer: Oni.Buffer
    context: Oni.BufferLayerRenderContext
}

interface State {
    status: "error" | "calculating" | "done" | null
    packages: string[]
}

class ImportCosts extends React.Component<Props, State> {
    emitter: any
    state = {
        status: null,
        packages: [],
    }

    componentDidMount() {
        this.setupEmitter()
    }

    componentDidUpdate({ context: { visibleLines: prevLines } }: Props) {
        const { context } = this.props
        if (context.visibleLines !== prevLines) {
            this.setupEmitter()
        }
    }

    componentWillUnmount() {
        this.emitter.removeAllListeners()
    }

    setupEmitter() {
        const { filePath } = this.props.buffer
        const { visibleLines } = this.props.context
        const fileContents = visibleLines.join("\n")
        const fileType = path.extname(filePath).includes(".ts") ? TYPESCRIPT : JAVASCRIPT

        this.emitter = importCost(filePath, fileContents, fileType)
        this.emitter.on("error", e => this.setState({ status: "error" }))
        this.emitter.on("start", packages => this.setState({ status: "calculating" }))
        this.emitter.on("calculated", pkg =>
            this.setState({ packages: [...this.state.packages, pkg] }),
        )
        this.emitter.on("done", packages => this.setState({ packages, status: "done" }))
    }

    getPosition = (line: number) => {
        const { context } = this.props
        const width = context.dimensions.width * context.fontPixelWidth
        const lineContent = context.visibleLines[line - 1]
        const character = lineContent.length || 0
        const pos = this.props.context.bufferToPixel({ character, line: line - 1 })

        return pos
            ? { left: pos.pixelX, top: pos.pixelY, width: width - pos.pixelX, hide: false }
            : { left: null, top: null, width: null, hide: true }
    }

    getSize = (num: number) => Math.round(num / 1000 * 10) / 10

    render() {
        const { status, packages } = this.state
        switch (status) {
            case "calculating":
                return <Package {...this.getPosition(1)}>calculating...</Package>
            case "done":
                return (
                    <Packages>
                        {packages.map(pkg => {
                            const position = this.getPosition(pkg.line)
                            return (
                                <Package key={pkg.line} data-id="import-cost" {...position}>
                                    {this.getSize(pkg.size)}kb{" "}
                                    <Gzip>(gzipped: {this.getSize(pkg.gzip)}kb)</Gzip>
                                </Package>
                            )
                        })}
                    </Packages>
                )
            default:
                return null
        }
    }
}

export class ImportCostLayer implements Oni.BufferLayer {
    constructor(private _oni: Oni.Plugin.Api, private _buffer) {}
    get id() {
        return "import-costs"
    }

    render(context: Oni.BufferLayerRenderContext) {
        return <ImportCosts buffer={this._buffer} context={context} />
    }
}

export interface OniWithLayers extends Oni.Plugin.Api {
    bufferLayers: {
        addBufferLayer: (
            compat: (buf: Oni.Buffer) => boolean,
            layer: (buf: Oni.Buffer) => Oni.BufferLayer,
        ) => void
    }
}

export const activate = async (oni: OniWithLayers) => {
    const isCompatible = (buf: Oni.Buffer) => {
        const ext = path.extname(buf.filePath)
        return ext.includes(".ts") || ext.includes(".js")
    }
    oni.bufferLayers.addBufferLayer(isCompatible, buf => new ImportCostLayer(oni, buf))
}
