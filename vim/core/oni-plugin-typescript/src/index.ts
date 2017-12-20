/**
 * index.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import * as types from "vscode-languageserver-types"

import { executeCommand, getCodeActions } from "./CodeActions"
import { getCompletionDetails, getCompletions } from "./Completion"
import { getDefinition } from "./Definition"
import { findAllReferences } from "./FindAllReferences"
import { formatRange } from "./Formatting"
import { LanguageConnection, LightweightLanguageClient } from "./LightweightLanguageClient"
import { getQuickInfo } from "./QuickInfo"
import { doRename } from "./Rename"
import { getSignatureHelp } from "./SignatureHelp"
import { getDocumentSymbols, getWorkspaceSymbols } from "./Symbols"
import { TypeScriptServerHost } from "./TypeScriptServerHost"
import * as Utility from "./Utility"

export const activate = (oni: Oni.Plugin.Api) => {

    const host = new TypeScriptServerHost(oni)

    const _lightweightLanguageClient = new LightweightLanguageClient()
    oni.language.registerLanguageClient("typescript", _lightweightLanguageClient)
    oni.language.registerLanguageClient("javascript", _lightweightLanguageClient)

    const connection = new LanguageConnection(_lightweightLanguageClient)

    host.on("semanticDiag", (diagnostics) => {
        const fileName = diagnostics.file

        const diags = diagnostics.diagnostics || []

        const errors = diags.map((d) => {
            // Convert lines to zero-based to accomodate protocol
            const startPosition = types.Position.create(d.start.line - 1, d.start.offset - 1)
            const endPosition = types.Position.create(d.end.line - 1, d.end.offset - 1)
            const range = types.Range.create(startPosition, endPosition)

            const ret: types.Diagnostic =  {
                // type: null,
                code: d.code,
                message: d.text,
                range,
                severity: types.DiagnosticSeverity.Error,
            }
            return ret
        })

        const language = Utility.getLanguageFromFileName(fileName)

        connection.notify("textDocument/publishDiagnostics", language, {
            uri: oni.language.wrapPathInFileUri(fileName),
            diagnostics: errors,
        })
    })

    const protocolOpenFile = (message: string, payload: any) => {
        const textDocument: any = payload.textDocument
        const filePath = oni.language.unwrapFileUriPath(textDocument.uri)

        host.openFile(filePath, textDocument.text)
    }

    const isSingleLineChange = (range: types.Range): boolean => {

        if (range.start.line === range.end.line) {
            return true
        }

        if (range.start.character === 0 && range.end.character === 0 && range.start.line + 1 === range.end.line) {
            return true
        }

        return false
    }

    const removeNewLines = (str: string) => {
        return str.replace(/(\r\n|\n|\r)/gm, "")
    }

    const protocolChangeFile = async (message: string, payload: any) => {

        const textDocument: types.TextDocumentIdentifier = payload.textDocument
        const contentChanges: types.TextDocumentContentChangeEvent[] = payload.contentChanges

        if (!contentChanges || !contentChanges.length) {
            return
        }

        if (contentChanges.length > 1) {
            oni.log.warn("Only handling first content change")
        }

        const filePath = oni.language.unwrapFileUriPath(textDocument.uri)

        const change = contentChanges[0]
        if (!change.range) {
            host.updateFile(filePath, change.text)
        } else if (isSingleLineChange(change.range) && change.text) {
            host.changeLineInFile(filePath, change.range.start.line + 1, removeNewLines(change.text))
        } else {
            oni.log.warn("Unhandled change request!")
        }


        const saveFile = oni.configuration.getValue<string>("debug.typescript.saveFile")
        if (saveFile) {
            host.saveTo(filePath, saveFile)
        }


        // Update errors for modified file
        host.getErrors(filePath)
    }

    const onSaved = (protocolName: string, payload: any) => {
        const textDocument = payload.textDocument
        const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
        host.getErrorsAcrossProject(filePath)
    }

    connection.subscribeToRequest("completionItem/resolve", getCompletionDetails(host))

    connection.subscribeToNotification("textDocument/didOpen", protocolOpenFile)
    connection.subscribeToNotification("textDocument/didChange", protocolChangeFile)
    connection.subscribeToNotification("textDocument/didSave", onSaved)

    connection.subscribeToRequest("textDocument/completion", getCompletions(oni, host))
    connection.subscribeToRequest("textDocument/codeAction", getCodeActions(oni, host))
    connection.subscribeToRequest("textDocument/definition", getDefinition(oni, host))
    connection.subscribeToRequest("textDocument/hover",  getQuickInfo(oni, host))
    connection.subscribeToRequest("textDocument/rangeFormatting", formatRange(oni, host))
    connection.subscribeToRequest("textDocument/references",  findAllReferences(oni, host))
    connection.subscribeToRequest("textDocument/rename",  doRename(oni, host))
    connection.subscribeToRequest("textDocument/signatureHelp",  getSignatureHelp(oni, host))
    connection.subscribeToRequest("textDocument/documentSymbol", getDocumentSymbols(oni, host))

    connection.subscribeToRequest("workspace/executeCommand", executeCommand(connection, oni, host))
    connection.subscribeToRequest("workspace/symbol", getWorkspaceSymbols(oni, host))
}
