import * as marked from "marked"
import * as React from "react"

export interface IState {
    source: string
}

export class MarkdownPreviewEditor implements Oni.IWindowSplit {
    constructor(
        private _oni: Oni.Plugin.Api
    ) { }

    public render(): JSX.Element {
        return <MarkdownPreview bufferEnter={this._oni.editors.activeEditor.onBufferEnter} />
    }
}

/**
 * Props are like the constructor arguments
 * for the React component (immutable)
 */
export interface IMarkdownPreviewProps {
    bufferEnter: Oni.IEvent<Oni.EditorBufferEventArgs>
}

export interface IMarkdownPreviewState {
    source: string
}

export class MarkdownPreview extends React.PureComponent<IMarkdownPreviewProps, IMarkdownPreviewState> {
    private _fs = require('fs')

    constructor(props: IMarkdownPreviewProps) {
        super(props)

        this.state = { source: "" }
    }

    private onBufferEnter(bufferInfo: Oni.EditorBufferEventArgs): void {
        if (bufferInfo.language == "markdown") {
            this.previewFile(bufferInfo.filePath)
        }
    }

    private previewFile(filePath: string): void {
        this.previewString("# Loading preview...")
        this._fs.readFile(filePath, (a, b) => this.fileLoaded(a, b))
    }

    private fileLoaded(err, data): void {
        if (err) {
            this.previewString("# Error while loading the file\r\n" + err)
            console.error(err);
        } else {
            this.previewString(data.toString())
        }
    }

    private previewString(str: string): void {
        this.setState({source: str})
    }


    componentDidMount() {
        this.props.bufferEnter.subscribe((onBufferEnterArgs) => this.onBufferEnter(onBufferEnterArgs))
        console.warn("Mounted");
    }

    componentWillUnmount() {
        // TODO: Dispose of subscription above
        console.warn("Unmounted");
    }

    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            padding: "1em 1em 1em 1em",
        }

        const html = marked(this.state.source)
        return <div style={containerStyle} dangerouslySetInnerHTML={{__html: html}}></div>
    }
}

var preview: MarkdownPreviewEditor = null

export const activate = (oni: any) => {
    if (!preview) {
        preview = new MarkdownPreviewEditor(oni)
    }

    oni.windows.split(1, new MarkdownPreviewEditor(oni))

    //oni.commands.registerCommand("markdown.preview", openPreview)
};

/*
const os = require("os");

import { editorManager } from "./../../../../browser/Services/EditorManager"


editorManager.allEditors.onBufferEnter.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
    const { language, filePath } = bufferInfo

    if (language) {
        this._statusBar.show(language)
        this._statusBar.setStatus(LanguageClientState.Initializing)
    } else {
        this._statusBar.hide()
    }

    return this.sendLanguageServerNotification(language, filePath, "textDocument/didOpen", async () => {
        const lines = await editorManager.activeEditor.activeBuffer.getLines()
        const text = lines.join(os.EOL)
        const version = editorManager.activeEditor.activeBuffer.version
        this._statusBar.setStatus(LanguageClientState.Active)
        return Helpers.pathToTextDocumentItemParams(filePath, language, text, version)
    })
})

editorManager.allEditors.onBufferLeave.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
    const { language, filePath } = bufferInfo
    return this.sendLanguageServerNotification(language, filePath, "textDocument/didClose", Helpers.pathToTextDocumentIdentifierParms(filePath))
})

editorManager.allEditors.onBufferChanged.subscribe(async (change: Oni.EditorBufferChangedEventArgs) => {

    const { language, filePath } = change.buffer

    const sendBufferThunk = async (capabilities: IServerCapabilities) => {
        const textDocument = {
            uri: Helpers.wrapPathInFileUri(filePath),
            version: change.buffer.version,
        }

        // If the service supports incremental capabilities, just pass it directly
        if (capabilities.textDocumentSync === 2) {
            return {
                textDocument,
                contentChanges: change.contentChanges,
            }
        // Otherwise, get the whole buffer and send it up
        } else {
            const allBufferLines = await change.buffer.getLines()

            return {
                textDocument,
                contentChanges: [{ text: allBufferLines.join(os.EOL) }],
            }
        }
    }

    return this.sendLanguageServerNotification(language, filePath, "textDocument/didChange", sendBufferThunk)
})
*/

