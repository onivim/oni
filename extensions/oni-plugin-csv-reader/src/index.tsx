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
    maxRowsToRender: number
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
    isShowing: boolean
}

const Title = styled<{ titleColor?: string }, "h4">("h4")`
    color: ${p => p.titleColor || "white"};
`

const Table = styled.table`
    border-radius: 8px;
    width: 90%;
`

const TableBody = styled.tbody``

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
    background-color: ${p => p.previewBackgroundColor || "black"};
`

interface IIndicator {
    isShowing: boolean
    togglePreview: () => void
}

const IndicatorCircle = styled<Partial<IIndicator>, "div">("div")`
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: whitesmoke;
    position: absolute;
    top: 2rem;
    right: 2rem;
    box-shadow: -1px 0 3px rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`

const PreviewIndicator: React.SFC<IIndicator> = ({ togglePreview, isShowing }) => {
    return (
        isShowing && (
            <IndicatorCircle onClick={togglePreview}>
                <span>hide</span>
            </IndicatorCircle>
        )
    )
}

class CSVReader extends React.Component<IProps, IState> {
    state = {
        rows: [],
        isShowing: true,
    }

    async componentDidMount() {
        this.props.setupCommand({
            name: "",
            detail: "",
            command: "oni.csv.preview.toggle",
            execute: this.togglePreview,
        })
        const rows = await this.convertLines()
        this.setState({ rows })
    }

    public togglePreview = () => this.setState({ isShowing: !this.state.isShowing })

    public convertLines = async () => {
        const lines = this.props.context.visibleLines.join("\n")
        try {
            const { data, errors } = await parseCsvString(lines)
            this.props.log("[Oni Plugin CSV Reader - Result]", data)
            return data
        } catch (e) {
            this.props.log("[Oni Plugin CSV Reader - Errror]", e)
            return []
        }
    }

    _orNull<T, S>(el: T, comp: S) {
        return el ? comp : null
    }

    _renderHeader = () => {
        const [firstObj] = this.state.rows
        if (firstObj) {
            const keys = Object.keys(firstObj)
            return (
                <TableHeader>
                    <tr>{keys.map((key, idx) => this._orNull(key, <th key={idx}>{key}</th>))}</tr>
                </TableHeader>
            )
        }
        return null
    }

    _renderBody = () => {
        const section = this.state.rows.slice(0, this.props.config.maxRowsToRender)
        return (
            <TableBody>
                {section.map((row, rowIdx) => (
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
        const { isShowing } = this.state
        return (
            isShowing && (
                <Container>
                    <PreviewIndicator togglePreview={this.togglePreview} isShowing={isShowing} />
                    <Title>{this.props.title}</Title>
                    <Table id="oni-csv-reader">
                        {this._renderHeader()}
                        {this._renderBody()}
                    </Table>
                    )}
                </Container>
            )
        )
    }
}

class CSVReaderLayer implements Oni.BufferLayer {
    constructor(private _oni: Oni.Plugin.Api, private _title: string) {}

    private _defaultConfig: IPreviewConfig = {
        maxRowsToRender: 100,
        previewBackgroundColor: "black",
        hasHeader: true,
    }

    public log = (...args) => {
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
