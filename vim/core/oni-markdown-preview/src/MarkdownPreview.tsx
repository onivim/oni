import * as marked from "marked"
import * as React from "react"

export class MarkdownPreview extends React.PureComponent<void, void> {
    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            padding: "1em 1em 1em 1em",
        }
        const htmlContent = marked("**ACDC**\r\n# Lad!")
        return <div style={containerStyle} dangerouslySetInnerHTML={{__html: htmlContent}}></div>
    }
}

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
