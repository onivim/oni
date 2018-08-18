import * as Oni from "oni-api"
import * as path from "path"
import * as React from "react"
import styled from "styled-components"
import { importCost, cleanup, JAVASCRIPT, TYPESCRIPT } from "import-cost"

enum Status {
    calculating = "calculating",
    done = "done",
    error = "error",
}

type Size = "small" | "medium" | "large"

interface IPackageProps {
    left: number
    top: number
    width: number
    hide: boolean
    background: string
    height: number
    priority: number
    packageSize?: Size
}

interface IPackage {
    name: string
    size: number
    gzip: number
    line: number
    status: Status
}

interface ISizeDetail {
    color: string
}

const px = (s: string | number) => `${s}px`

const SizeDetail = styled<ISizeDetail, "span">("span")`
    color: ${p => p.color};
`

const hidden: VisibilityState = "hidden"
const visible: VisibilityState = "visible"

const Package = styled.div.attrs<IPackageProps>({
    style: (props: IPackageProps) => ({
        left: px(props.left),
        top: px(props.top),
        visibility: props.hide ? hidden : visible,
    }),
})`
    height: ${p => px(p.height)};
    background-color: ${p => p.background};
    line-height: ${p => px(p.height + 1)};
    position: absolute;
    padding-left: 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    z-index: ${p => p.priority};
`

const Packages = styled.div`
    position: relative;
`

interface IPkgDetails {
    kb: number
    size: Size
}

interface Props extends ImportSettings {
    priority: number
    buffer: Oni.EditorBufferEventArgs
    context: Oni.BufferLayerRenderContext
    colors: { [color: string]: string }
    log: (...args: any[]) => void
}

interface State {
    error: string
    packages: IPackage[]
}

class ImportCosts extends React.Component<Props, State> {
    emitter: NodeJS.EventEmitter
    state: State = {
        error: null,
        packages: [],
    }

    componentDidMount() {
        this.setupEmitter()
    }

    componentDidUpdate({ context: { visibleLines: prevLines } }) {
        const { context } = this.props
        if (context.visibleLines !== prevLines) {
            this.setupEmitter()
        }
    }

    componentWillUnmount() {
        this.emitter.removeAllListeners()
    }

    componentDidCatch(error: Error) {
        this.setState({ error: error.message })
    }

    setupEmitter() {
        const { filePath } = this.props.buffer
        const { visibleLines } = this.props.context
        const fileContents = visibleLines.join("\n")
        const fileType = path.extname(filePath).includes(".ts") ? TYPESCRIPT : JAVASCRIPT

        this.emitter = importCost(filePath, fileContents, fileType)
        this.emitter.on("error", error => {
            this.props.log("Oni import-cost error:", error)
            this.setState({ error })
        })
        this.emitter.on("start", (packages: IPackage[]) =>
            this.setState({
                error: null,
                packages: packages.map(pkg => ({ ...pkg, status: Status.calculating })),
            }),
        )
        this.emitter.on("calculated", (pkg: IPackage) => {
            // Ignore packages with no size values
            if (pkg.size) {
                const packages = this.state.packages.map(
                    loaded => (pkg.name === loaded.name ? { ...pkg, status: Status.done } : loaded),
                )

                this.setState({ packages })
            }
        })
        this.emitter.on("done", (packages: IPackage[]) => {
            const updated = this.state.packages.map(pkg => ({
                ...pkg,
                status: pkg.status === Status.done ? pkg.status : null,
            }))
            this.setState({ packages: updated })
        })
    }

    getPosition = (line: number) => {
        const { context } = this.props
        const zeroBasedLine = line - 1
        const width = context.dimensions.width * context.fontPixelWidth
        const lineContent = context.visibleLines[zeroBasedLine]
        const character = lineContent.length || 0
        // line is the non-zero indexed line, topBufferLine is also non-zero indexed
        const bufferline = this.props.context.topBufferLine - 1 + zeroBasedLine
        const position = this.props.context.bufferToPixel({ character, line: bufferline })
        const PADDING = 5

        return {
            left: position ? position.pixelX : null,
            top: position ? position.pixelY : null,
            width: position ? width - position.pixelX - PADDING : null,
            hide: !position,
        }
    }

    getSize = (num: number): IPkgDetails => {
        if (!num) {
            return {
                kb: null,
                size: null,
            }
        }
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

    getCalculation = () => {
        return this.props.showCalculating ? (
            <SizeDetail color="white">calculating...</SizeDetail>
        ) : null
    }

    getSizeText = (gzip: IPkgDetails, pkg: IPkgDetails) => {
        const { sizeColors } = this.props
        return (
            <>
                <SizeDetail color={sizeColors[pkg.size]}>{pkg.kb}kb</SizeDetail>
                <SizeDetail color={sizeColors[gzip.size]}> (gzipped: {gzip.kb}kb)</SizeDetail>
            </>
        )
    }

    render() {
        const { packages, error } = this.state
        const { colors, context, priority } = this.props
        const background = colors["editor.background"]
        const height = context.fontPixelHeight
        return (
            !error && (
                <Packages>
                    {packages.map((pkg, idx) => {
                        const position = this.getPosition(pkg.line)
                        const gzipSize = this.getSize(pkg.gzip)
                        const pkgSize = this.getSize(pkg.size)
                        return pkg.status ? (
                            <Package
                                {...position}
                                data-id="import-cost"
                                height={height}
                                priority={priority}
                                background={background}
                                packageSize={pkgSize.size}
                                key={`${pkg.line}-${pkg.name}-${idx}`}
                            >
                                {pkg.status === Status.calculating
                                    ? this.getCalculation()
                                    : this.getSizeText(gzipSize, pkgSize)}
                            </Package>
                        ) : null
                    })}
                </Packages>
            )
        )
    }
}

interface ImportSettings {
    enabled: boolean
    largeSize: number
    smallSize: number
    showCalculating: boolean
    sizeColors: {
        small: string
        large: string
        medium: string
    }
}

export class ImportCostLayer implements Oni.BufferLayer {
    private _config: ImportSettings
    private defaultConfig: ImportSettings = {
        enabled: false,
        largeSize: 50,
        smallSize: 5,
        showCalculating: false,
        sizeColors: {
            small: "green",
            large: "red",
            medium: "yellow",
        },
    }

    private readonly PLUGIN_NAME = "oni.plugins.importCost"

    constructor(private _oni: OniWithColor, private _buffer: Oni.EditorBufferEventArgs) {
        this._config = this._getConfig()

        this._oni.configuration.onConfigurationChanged.subscribe(configChanges => {
            if (this.PLUGIN_NAME in configChanges) {
                this._config = configChanges[this.PLUGIN_NAME]
                if (!this._config.enabled) {
                    cleanup()
                }
            }
        })
    }
    get id() {
        return "import-costs"
    }

    get friendlyName() {
        return "Package sizes buffer layer"
    }

    log = (...args: any[]) => {
        this._oni.log.warn(...args)
    }

    private _getConfig() {
        const userConfig = this._oni.configuration.getValue<ImportSettings>(this.PLUGIN_NAME)
        return { ...this.defaultConfig, ...userConfig }
    }

    getPriority() {
        const priorities = this._oni.configuration.getValue<string[]>("layers.priority", [])
        const index = priorities.indexOf(this.id)
        return index >= 0 ? priorities.length - index : 0
    }

    render(context: Oni.BufferLayerRenderContext) {
        const colors = this._oni.colors.getColors()
        const priority = this.getPriority()
        return (
            this._config.enabled && (
                <ImportCosts
                    {...this._config}
                    log={this.log}
                    colors={colors}
                    context={context}
                    priority={priority}
                    buffer={this._buffer}
                />
            )
        )
    }
}

// TODO: Add to API
export interface OniWithColor extends Oni.Plugin.Api {
    colors: {
        getColor(color: string): string
        getColors(): { [key: string]: string }
    }
}

const isCompatible = (buf: Oni.EditorBufferEventArgs) => {
    const ext = path.extname(buf.filePath)
    const allowedExtensions = [".js", ".jsx", ".ts", ".tsx"]
    return allowedExtensions.includes(ext)
}

export const activate = (oni: OniWithColor) => {
    oni.editors.activeEditor.onBufferEnter.subscribe(buf => {
        const layer = new ImportCostLayer(oni, buf)
        if (isCompatible(buf)) {
            oni.editors.activeEditor.activeBuffer.addLayer(layer)
        } else {
            cleanup() // kill worker processes if layer isn't to be rendered
            oni.editors.activeEditor.activeBuffer.removeLayer(layer)
        }
    })
}
