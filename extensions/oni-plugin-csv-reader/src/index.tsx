import * as Oni from "oni-api"
import * as React from "react"
import * as path from "path"

import { parseCsvToRowsAndColumn } from "./utils"

const isCompatible = (buf: Oni.EditorBufferEventArgs) => {
    const ext = path.extname(buf.filePath)
    return ext === ".csv"
}

interface IProps {
    context: Oni.BufferLayerRenderContext
}

interface IState {
    csv: string[][]
}

class CSVReader extends React.Component<IProps, IState> {
    state = {
        csv: null,
    }

    componentDidMount() {
        this.convertLines()
    }

    convertLines() {
        const lines = this.props.context.visibleLines.join("\n")
        const csv = parseCsvToRowsAndColumn(lines)
        this.setState({ csv })
    }
    render() {
        console.log("csv: ", this.state.csv)
        return <div>Reader</div>
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
    oni.editors.activeEditor.onBufferEnter.subscribe(buf => {
        const layer = new CSVReaderLayer()
        if (isCompatible(buf)) {
            oni.editors.activeEditor.activeBuffer.addLayer(layer)
        } else {
            oni.editors.activeEditor.activeBuffer.removeLayer(layer)
        }
    })
}
