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

interface IProps {
    log: (args: any) => void
    context: Oni.BufferLayerRenderContext
}

interface IState {
    rows: ParseResult["data"]
}

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

const Container = styled<{ csvPreviewBackground?: string }, "div">("div")`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: ${p => p.csvPreviewBackground || "black"};
`

class CSVReader extends React.Component<IProps, IState> {
    state = {
        rows: [],
    }

    async componentDidMount() {
        const rows = await this.convertLines()
        this.setState({ rows })
    }

    public convertLines = async () => {
        const lines = this.props.context.visibleLines.join("\n")
        try {
            const { data, errors } = await parseCsvString(lines)
            this.props.log(data)
            return data
        } catch (e) {
            this.props.log(e)
            return []
        }
    }

    _renderHeader = () => {
        const [firstObj] = this.state.rows
        if (firstObj) {
            const keys = Object.keys(firstObj)
            return (
                <TableHeader>
                    <tr>{keys.map((key, idx) => <th key={idx}>{key}</th>)}</tr>
                </TableHeader>
            )
        }
        return null
    }

    _renderBody = () => {
        return (
            <TableBody>
                {this.state.rows.map((row, rowIdx) => (
                    <TableRow key={`row-${rowIdx}`}>
                        {Object.values(row).map((item, idx) => (
                            <TableCell key={`${item}-${idx}`}>{item}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    render() {
        return (
            <Container>
                <Table id="oni-csv-reader">
                    {this._renderHeader()}
                    {this._renderBody()}
                </Table>
            </Container>
        )
    }
}

class CSVReaderLayer implements Oni.BufferLayer {
    constructor(private _oni: Oni.Plugin.Api) {}
    public log = (...args) => {
        this._oni.log(...args)
    }
    public get id() {
        return "oni.csv.reader"
    }

    render(context: Oni.BufferLayerRenderContext) {
        return <CSVReader context={context} log={this.log} />
    }
}

export const activate = (oni: Oni.Plugin.Api) => {
    oni.editors.activeEditor.onBufferEnter.subscribe(async buf => {
        const layer = new CSVReaderLayer(oni)
        if (isCompatible(buf)) {
            // const ext = path.extname(buf.filePath)
            // const bufferName = buf.filePath.replace("ext", "")
            // const preview = await oni.editors.activeEditor.openFile(`CSV PREVIEW`)
            // preview.addLayer(layer)
            oni.editors.activeEditor.activeBuffer.addLayer(layer)
        }
    })
}
