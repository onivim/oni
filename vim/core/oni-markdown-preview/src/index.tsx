import * as marked from "marked"
import * as React from "react"

export interface IState {
    source: string
}

export class MarkdownPreviewEditor extends React.PureComponent<void, IState> {

    private _fs = require('fs')
    private _oni: Oni.Plugin.Api
    private _isOpen: boolean

    constructor(
        private oni: any
    ) {
        super()
        this.state = {source: ""}
        this._oni = oni
        this._isOpen = false

        oni.editors.allEditors.onBufferEnter.subscribe((a) => this.onBufferEnter(a))
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
        if (!this._isOpen) {
            this._isOpen = true
            this._oni.windows.split(/*SplitDirection.Horizontal*/1, this)
        }

        this.setState({source: str})
    }

    componentDidMount() {
        console.warn("Mounted");
    }

    componentWillUnmount() {
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

export const activate = (oni: Oni.Plugin.Api) => {
    if (!preview) {
        preview = new MarkdownPreviewEditor(oni)
    }

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

