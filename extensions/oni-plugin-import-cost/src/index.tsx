import * as Oni from "oni-api"
import * as path from "path"
import * as React from "react"
import { importCost, cleanup, JAVASCRIPT, TYPESCRIPT } from "import-cost"

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

    async componentDidMount() {
        const { filePath } = this.props.buffer
        const contentsArray = await this.props.buffer.getLines(0)
        const fileContents = contentsArray.join("\n")
        const filetype = path.extname(filePath).includes(".ts") ? TYPESCRIPT : JAVASCRIPT
        this.setupEmitter(filePath, filetype, fileContents)
    }

    componentWillUnmount() {
        this.emitter.removeAllListeners()
    }

    setupEmitter(filePath: string, filetype: string, fileContents: string) {
        this.emitter = importCost(filePath, fileContents, filetype)
        this.emitter.on("error", e => this.setState({ status: "error" }))
        this.emitter.on("start", packages => this.setState({ status: "calculating" }))
        this.emitter.on("calculated", pkg =>
            this.setState({ packages: [...this.state.packages, pkg] }),
        )
        this.emitter.on("done", packages => this.setState({ packages, status: "done" }))
    }

    getPosition = (line: number) => {
        const lineContent = this.props.context.visibleLines[line - 1]
        const character = lineContent.length || 0
        console.log("line: ", line)
        console.log("lineContent: ", lineContent)
        console.log("character: ", character)
        const pos = this.props.context.bufferToPixel({ character, line: line + 1 })
        return pos ? pos.pixelX : null
    }

    render() {
        const { status, packages } = this.state
        switch (status) {
            case "calculating":
                return <div>calculating...</div>
            case "done":
                return (
                    <div style={{ position: "relative", top: 0, left: 0, right: 0, bottom: 0 }}>
                        {packages.map(pkg => (
                            <span
                                style={{ left: this.getPosition(pkg.line), position: "absolute" }}
                            >
                                {pkg.name} {pkg.gzip} {pkg.line}
                            </span>
                        ))}
                    </div>
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
    bufferLayers: any
}

export const activate = async (oni: OniWithLayers) => {
    const isCompatible = (buf: Oni.Buffer) => {
        const ext = path.extname(buf.filePath)
        return ext.includes(".ts") || ext.includes(".js")
    }
    oni.bufferLayers.addBufferLayer(isCompatible, buf => {
        return new ImportCostLayer(oni, buf)
    })
}
