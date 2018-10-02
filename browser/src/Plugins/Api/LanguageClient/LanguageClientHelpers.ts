/**
 * LanguageClientHelpers.ts
 */

import * as os from "os"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import * as Utility from "./../../../Utility"

export namespace TextDocumentSyncKind {
    export const None = 0
    export const Full = 1
    export const Incremental = 2
}

export interface CompletionOptions {
    /**
     * The server provides support to resolve additional
     * information for a completion item.
     */
    resolveProvider?: boolean

    /**
     * The characters that trigger completion automatically.
     */
    triggerCharacters?: string[]
}

// ServerCapabilities
// Defined in the LSP protocol: https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
export interface ServerCapabilities {
    completionProvider?: CompletionOptions
    textDocumentSync?: number
    documentSymbolProvider?: boolean
}

export const wrapPathInFileUri = (path: string) => getFilePrefix() + Utility.normalizePath(path)

export const unwrapFileUriPath = (uri: string) => decodeURIComponent(uri.split(getFilePrefix())[1])

export const getTextFromContents = (
    contents: types.MarkedString | types.MarkupContent | types.MarkedString[],
): IMarkedStringResult[] => {
    if (contents instanceof Array) {
        return contents.map(markedString => getTextFromMarkedString(markedString))
    }
    const text = isMarkupContent(contents) ? getDocumentationText(contents) : contents
    return [getTextFromMarkedString(text)]
}

export const pathToTextDocumentIdentifierParms = (path: string) => ({
    textDocument: {
        uri: wrapPathInFileUri(path),
    },
})

export const pathToTextDocumentItemParams = (
    path: string,
    language: string,
    text: string,
    version: number,
) => ({
    textDocument: {
        uri: wrapPathInFileUri(path),
        languageId: language,
        text,
        version,
    },
})

export const eventContextToCodeActionParams = (filePath: string, range: types.Range) => {
    const emptyDiagnostics: types.Diagnostic[] = []
    return {
        textDocument: {
            uri: wrapPathInFileUri(filePath),
        },
        range,
        context: { diagnostics: emptyDiagnostics },
    }
}

export const createTextDocumentPositionParams = (
    filePath: string,
    line: number,
    column: number,
) => ({
    textDocument: {
        uri: wrapPathInFileUri(filePath),
    },
    position: {
        line,
        character: column,
    },
})

export const bufferToTextDocumentPositionParams = (buffer: Oni.Buffer) => {
    return createTextDocumentPositionParams(
        buffer.filePath,
        buffer.cursor.line,
        buffer.cursor.column,
    )
}

export const createDidChangeTextDocumentParams = (
    bufferFullPath: string,
    lines: string[],
    version: number,
) => {
    const text = lines.join(os.EOL)

    return {
        textDocument: {
            uri: wrapPathInFileUri(bufferFullPath),
            version,
        },
        contentChanges: [
            {
                text,
            },
        ],
    }
}

interface IMarkedStringResult {
    value: string
    language: string
}

const getTextFromMarkedString = (markedString: types.MarkedString): IMarkedStringResult => {
    if (typeof markedString === "string") {
        return {
            language: null,
            value: markedString,
        }
    } else {
        return {
            // Split the language as it passed as e.g. "reason.hover.type"
            language: markedString.language ? markedString.language.split(".")[0] : null,
            value: markedString.value,
        }
    }
}

const getFilePrefix = () => {
    if (process.platform === "win32") {
        return "file:///"
    } else {
        return "file://"
    }
}

export function isMarkupContent(input: any): input is types.MarkupContent {
    return typeof input === "object" && input !== null && "value" in input && "kind" in input
}

export const getDocumentationText = (documentation: string | types.MarkupContent) => {
    // Documentation can be a string or an object specifying the documentations type as well as the value.
    if (typeof documentation === "string") {
        return documentation
    }
    return documentation.value
}
