import * as Oni from "oni-api"
import * as React from "react"
import * as path from "path"
import { ParseResult } from "papaparse"
import { Table, Column } from "react-virtualized"

import { parseCsvString } from "./utils"

const isCompatible = (buf: Oni.EditorBufferEventArgs) => {
    const ext = path.extname(buf.filePath)
    return ext === ".csv"
}

interface IProps {
    context: Oni.BufferLayerRenderContext
}

interface IState {
    csv: ParseResult["data"]
}

class CSVReader extends React.Component<IProps, IState> {
    state = {
        csv: [],
    }

    async componentDidMount() {
        await this.convertLines()
    }

    async convertLines() {
        const lines = this.props.context.visibleLines.join("\n")
        try {
            const { data, errors } = await parseCsvString(lines)
            console.log("data: ", data)
            this.setState({ csv: data })
        } catch (e) {
            console.log("[Oni-CSV-Reader Error]: ", e)
        }
    }
    render() {
        return (
            <Table
                width={300}
                height={300}
                rowHeight={30}
                headerHeight={20}
                rowCount={this.state.csv.length}
                rowGetter={this._getDatum}
            >
                <Column dataKey="name" width={90} />
                <Column
                    width={210}
                    disableSort
                    dataKey="random"
                    cellRenderer={({ cellData }) => console.log({ cellData }) || cellData}
                    flexGrow={1}
                />
            </Table>
        )
    }
    _getDatum = ({ index }) => {
        console.log("this.state.csv[index]: ", this.state.csv[index])
        return this.state.csv[index]
    }
}

class CSVReaderLayer implements Oni.BufferLayer {
    public get id() {
        return "oni.csv.reader"
    }

    render(context: Oni.BufferLayerRenderContext) {
        return <CSVReader context={context} />
    }
}

export const activate = (oni: Oni.Plugin.Api) => {
    oni.editors.activeEditor.onBufferEnter.subscribe(async buf => {
        const layer = new CSVReaderLayer()
        if (isCompatible(buf)) {
            // const ext = path.extname(buf.filePath)
            // const bufferName = buf.filePath.replace("ext", "")
            // const preview = await oni.editors.activeEditor.openFile(`CSV PREVIEW`)
            // preview.addLayer(layer)
            oni.editors.activeEditor.activeBuffer.addLayer(layer)
        }
    })
}
