import * as Oni from "oni-api"
import * as React from "react"
import * as path from "path"
import styled from "styled-components"
import { ParseResult } from "papaparse"

import { parseCsvString } from "./utils"

const isCompatible = (buf: Oni.EditorBufferEventArgs) => {
    const ext = path.extname(buf.filePath)
    return ext === ".csv"
}

interface IPreviewConfig {
    rowsPerPage: number
    previewBackgroundColor: string
    hasHeader: boolean
}

interface IProps {
    log: (...args: any[]) => void
    setupCommand: (c: Oni.Commands.ICommand) => void
    title: string
    config: IPreviewConfig
    context: Oni.BufferLayerRenderContext
}

interface IState {
    rows: ParseResult["data"]
    error: string
    isShowing: boolean
    currentPage: number
    pageSize: number
    currentSection: ParseResult["data"]
}

const Title = styled<{ titleColor?: string }, "h4">("h4")`
    width: 100%;
    text-align: center;
    color: ${p => p.titleColor || "white"};
`

const Table = styled.table`
    border-radius: 8px;
    width: 90%;
`

const TableBody = styled.tbody`
    width: 100%;
    height: 100%;
    overflow: hidden;
    &:hover {
        overflow: overlay;
    }
`

const TableHeader = styled.thead`
    background-color: rgba(100, 100, 100, 0.5);
`
const TableRow = styled.tr``

const TableCell = styled.td`
    background-color: white;
    text-align: center;
`

const Container = styled<{ previewBackgroundColor?: string }, "div">("div")`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 3;
    background-color: ${p => p.previewBackgroundColor};
    pointer-events: all;
`

interface IIndicator {
    changePage: (evt: any) => void
    page: number
}

const IndicatorCircle = styled<{}, "div">("div")`
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: whitesmoke;
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`

const PageIndicator: React.SFC<IIndicator> = ({ changePage, page }) => {
    return (
        <IndicatorCircle onClick={changePage}>
            <span>{page}</span>
        </IndicatorCircle>
    )
}

class CSVReader extends React.Component<IProps, IState> {
    state: IState = {
        rows: [],
        error: null,
        currentSection: [],
        currentPage: 1,
        isShowing: true,
        pageSize: this.props.config.rowsPerPage,
    }

    async componentDidMount() {
        this._setupCommands()
        await this._loadCsv()
    }

    async componentDidUpdate(prevProps: IProps) {
        if (prevProps.context.visibleLines !== this.props.context.visibleLines) {
            await this._loadCsv()
        }
    }

    public togglePreview = () => this.setState({ isShowing: !this.state.isShowing })

    public changePage = (step: number = 0) => {
        const { currentPage, rows, pageSize } = this.state
        const noOfPages = Math.ceil(rows.length / pageSize)
        const nextPage = currentPage + step
        const pageToUse = nextPage > noOfPages ? 1 : nextPage
        const indexOfLastItem = pageToUse * pageSize
        const indexOfFirstItem = indexOfLastItem - pageSize
        const nextSection = this.state.rows.slice(indexOfFirstItem, indexOfLastItem)
        this.setState({ currentSection: nextSection, currentPage: pageToUse })
    }

    public convertLines = async () => {
        const lines = this.props.context.visibleLines.join("\n")
        try {
            const { data, errors } = await parseCsvString(lines)
            this.props.log("[Oni Plugin CSV Reader - Result]", data)
            return data
        } catch (error) {
            this.props.log("[Oni Plugin CSV Reader - Error]", error)
            this.setState({ error: error.message })
            return []
        }
    }

    _loadCsv = async () => {
        const rows = await this.convertLines()
        this.setState({ rows }, this.changePage)
    }

    _setupCommands = () => {
        this.props.setupCommand({
            name: "",
            detail: "",
            command: "oni.csv.preview.toggle",
            execute: this.togglePreview,
        })

        this.props.setupCommand({
            name: "",
            detail: "",
            command: "oni.csv.preview.next",
            execute: () => this.changePage(1),
        })

        this.props.setupCommand({
            name: "",
            detail: "",
            command: "oni.csv.preview.previous",
            execute: () => this.changePage(-1),
        })
    }

    _orNull<T, S>(el: T, comp: S) {
        return el ? comp : null
    }

    _renderHeader = (hasHeader: boolean) => {
        const [firstItem] = this.state.currentSection
        if (!hasHeader || !firstItem) {
            return null
        }
        if (firstItem) {
            return (
                <TableHeader>
                    <tr>
                        {Object.keys(firstItem).map((key, idx) =>
                            this._orNull(key, <th key={idx}>{key}</th>),
                        )}
                    </tr>
                </TableHeader>
            )
        }
    }

    _renderBody = () => {
        return (
            <TableBody>
                {this.state.currentSection.map((row, rowIdx) => (
                    <TableRow key={`row-${rowIdx}`}>
                        {Object.values(row).map((item, idx) =>
                            this._orNull(
                                item,
                                <TableCell key={`${item}-${idx}`}>{item}</TableCell>,
                            ),
                        )}
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    render() {
        const { config } = this.props
        const { isShowing, currentPage, error } = this.state
        return (
            isShowing && (
                <Container
                    id="oni-csv-reader"
                    previewBackgroundColor={config.previewBackgroundColor}
                >
                    {!error ? (
                        <>
                            <Title>{this.props.title}</Title>
                            <Table>
                                {this._renderHeader(config.hasHeader)}
                                {this._renderBody()}
                            </Table>
                            <PageIndicator
                                page={currentPage}
                                changePage={() => this.changePage(1)}
                            />
                        </>
                    ) : (
                        <Title>{error}</Title>
                    )}
                </Container>
            )
        )
    }
}

class CSVReaderLayer implements Oni.BufferLayer {
    constructor(private _oni: Oni.Plugin.Api, private _title: string) {}

    private _defaultConfig: IPreviewConfig = {
        rowsPerPage: 30,
        previewBackgroundColor: "rgba(0, 0, 0, 0.8)",
        hasHeader: true,
    }

    public log = (...args: any[]) => {
        this._oni.log.info(...args)
    }

    public getConfig = () => {
        const config = this._oni.configuration.getValue<IPreviewConfig>("experimental.csv.preview")
        return config || this._defaultConfig
    }

    public setupCommand = (command: Oni.Commands.ICommand) => {
        this._oni.commands.registerCommand(command)
    }

    public get id() {
        return "oni.csv.reader"
    }

    render(context: Oni.BufferLayerRenderContext) {
        return (
            <CSVReader
                context={context}
                title={this._title}
                log={this.log}
                setupCommand={this.setupCommand}
                config={this.getConfig()}
            />
        )
    }
}

export const activate = (oni: Oni.Plugin.Api) => {
    oni.editors.activeEditor.onBufferEnter.subscribe(async buf => {
        const title = `CSV PREVIEW - "${buf.filePath}"`
        const layer = new CSVReaderLayer(oni, title)
        if (isCompatible(buf)) {
            oni.editors.activeEditor.activeBuffer.addLayer(layer)
        }
    })
}
