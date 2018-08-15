import * as Oni from "oni-api"
import * as path from "path"
import * as React from "react"
import styled, { ThemedStyledFunction } from "styled-components"
import { importCost, cleanup, JAVASCRIPT, TYPESCRIPT } from "import-cost"

interface PackageProps extends SizeProps {
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

interface SizeProps {
    size: "small" | "medium" | "large"
}

const px = (s: string | number) => `${s}px`

export type StyledFunction<T> = ThemedStyledFunction<T, {}>

export function withProps<T, U extends HTMLElement = HTMLElement>(
    styledFunction: StyledFunction<React.HTMLProps<U>>,
): StyledFunction<T & React.HTMLProps<U>> {
    return styledFunction
}

const getColorForSize = (size: SizeProps["size"]) => {
    switch (size) {
        case "small":
            return "green"
        case "medium":
            return "yellow"
        case "large":
            return "red"
        default:
            return "white"
    }
}

const Gzip = styled<SizeProps, "span">("span")`
    color: ${p => getColorForSize(p.size)};
`

const Package = withProps<PackageProps>(styled.div).attrs({
    style: (props: PackageProps) => ({
        left: px(props.left),
        top: px(props.top),
        width: px(props.width),
        visibility: props.hide ? "hidden" : "visible",
    }),
})`
    color: ${p => getColorForSize(p.size)};
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
    largeSize: number
    smallSize: number
    context: Oni.BufferLayerRenderContext
}

interface State {
    status: "error" | "calculating" | "done" | null
    packages: IPackage[]
}

class ImportCosts extends React.Component<Props, State> {
    emitter: any
    state: State = {
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
        this.emitter.on("error", error => {
            console.warn("Oni import-cost error:", error)
            this.setState({ status: "error" })
        })
        this.emitter.on("start", packages => this.setState({ status: "calculating" }))
        this.emitter.on("calculated", pkg =>
            this.setState({ packages: [...this.state.packages, pkg], status: "done" }),
        )
        this.emitter.on("done", packages => {
            this.setState({ packages, status: "done" })
            cleanup()
        })
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

    getSize = (num: number): { kb: number; size: SizeProps["size"] } => {
        const sizeInKbs = Math.round(num / 1024 * 10) / 10
        const sizeDescription =
            sizeInKbs >= this.props.largeSize
                ? "large"
                : this.props.smallSize >= sizeInKbs
                    ? "small"
                    : "medium"
        return {
            kb: sizeInKbs,
            size: sizeDescription,
        }
    }

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
                            const gzipSize = this.getSize(pkg.gzip)
                            const pkgSize = this.getSize(pkg.size)
                            return pkg.size ? (
                                <Package
                                    {...position}
                                    key={pkg.line}
                                    size={pkgSize.size}
                                    data-id="import-cost"
                                >
                                    {pkgSize.kb}kb
                                    <Gzip size={gzipSize.size}> (gzipped: {gzipSize.kb}kb)</Gzip>
                                </Package>
                            ) : null
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

    get friendlyName() {
        return "Package sizes buffer layer"
    }

    render(context: Oni.BufferLayerRenderContext) {
        return <ImportCosts buffer={this._buffer} context={context} largeSize={50} smallSize={5} />
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
