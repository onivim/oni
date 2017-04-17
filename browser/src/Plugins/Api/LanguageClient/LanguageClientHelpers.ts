/**
 * LanguageClientHelpers.ts
 */

import * as os from "os"

import * as types from "vscode-languageserver-types"

export const ProtocolConstants = {
    Initialize: "initialize",
    Telemetry: {
        Event: "telemetry/event",
    },
    TextDocument: {
        Completion: "textDocument/completion",
        Hover: "textDocument/hover",
        Definition: "textDocument/definition",
        DocumentSymbol: "textDocument/documentSymbol",
        DidChange: "textDocument/didChange",
    },
    Window: {
        LogMessage: "window/logMessage",
        ShowMessage: "window/showMessage",
    },
}

export const wrapPathInFileUri = (path: string) => "file:///" + path

export const unwrapFileUriPath = (uri: string) => decodeURIComponent((uri).split("file:///")[1])

export const bufferUpdateToTextDocumentItem = (args: Oni.BufferUpdateContext): types.TextDocumentItem => {
    const lines = args.bufferLines
    const { bufferFullPath, filetype, version } = args.eventContext
    const text = lines.join(os.EOL)

    return {
        uri: wrapPathInFileUri(bufferFullPath),
        languageId: filetype,
        version,
        text,
    }
}

export const eventContextToTextDocumentPositionParams = (args: Oni.EventContext) => ({
    textDocument: {
        uri: wrapPathInFileUri(args.bufferFullPath),
    },
    position: {
        line: args.line - 1,
        character: args.column - 1,
    },
})

export const bufferUpdateToDidChangeTextDocumentParams = (args: Oni.BufferUpdateContext) => {
    const lines = args.bufferLines
    const { bufferFullPath, version } = args.eventContext
    const text = lines.join(os.EOL)

    return {
        textDocument: {
            uri: wrapPathInFileUri(bufferFullPath),
            version,
        },
        contentChanges: [{
            text,
        }],
    }
}

export const incrementalBufferUpdateToDidChangeTextDocumentParams = (args: Oni.IncrementalBufferUpdateContext, previousLine: string) => {
    const changedLine = args.bufferLine
    const lineNumber = args.lineNumber
    const previousLineLength = previousLine.length

    return {
        textDocument: {
            uri: wrapPathInFileUri(args.eventContext.bufferFullPath),
            version: args.eventContext.version,
        },
        contentChanges: [{
            range: types.Range.create(lineNumber - 1, 0, lineNumber - 1, previousLineLength),
            text: changedLine,
        }],
    }
}
