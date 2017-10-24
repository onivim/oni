/**
 * index.ts
 *
 * Entry point for ONI's TypeScript Language Service integraiton
 */

/// <reference path="./../../../../definitions/Oni.d.ts" />
/// <reference path="./../../../../node_modules/typescript/lib/protocol.d.ts" />

import * as os from "os"
import * as path from "path"

import * as types from "vscode-languageserver-types"

import { getCompletions, getCompletionDetails } from "./Completion"
import { getDefinition } from "./Definition"
import { findAllReferences } from "./FindAllReferences"
import { LightweightLanguageClient } from "./LightweightLanguageClient"
import { getQuickInfo } from "./QuickInfo"
import { getSignatureHelp } from "./SignatureHelp"
import { TypeScriptServerHost } from "./TypeScriptServerHost"

export const activate = (oni: Oni.Plugin.Api) => {

    const host = new TypeScriptServerHost(oni)

    const lightweightLanguageClient = new LightweightLanguageClient()
    oni.language.registerLanguageClient("typescript", lightweightLanguageClient)
    oni.language.registerLanguageClient("javascript", lightweightLanguageClient)

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


        const extension = path.extname(fileName)
        const language = extension === ".js" || extension === ".jsx" ? "javascript" : "typescript"

        lightweightLanguageClient.notify("textDocument/publishDiagnostics", language, {
            uri: oni.language.wrapPathInFileUri(fileName),
            diagnostics: errors,
        })
    })

    const protocolOpenFile = (message: string, payload: any) => {
        const textDocument: types.TextDocumentIdentifier = payload.textDocument
        const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
        host.openFile(filePath)
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

    const protocolChangeFile = (message: string, payload: any) => {

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
    }

    // TODO:
    const getCodeActions = async (protocolName: string, payload: any): Promise<types.Command[]> => {

        const textDocument = payload.textDocument
        const range = payload.range
        const filePath = oni.language.unwrapFileUriPath(textDocument.uri)

        const val = await host.getRefactors(filePath, range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1)

        // TODO: Implement code actions
        oni.log.verbose(val)
        return val
    }

    const onSaved = (protocolName: string, payload: any) => {
        const textDocument = payload.textDocument
        const filePath = oni.language.unwrapFileUriPath(textDocument.uri)
        host.getErrorsAcrossProject(filePath)
    }

    lightweightLanguageClient.handleNotification("textDocument/didOpen", protocolOpenFile)
    lightweightLanguageClient.handleNotification("textDocument/didChange", protocolChangeFile)
    lightweightLanguageClient.handleNotification("textDocument/didSave", onSaved)

    lightweightLanguageClient.handleRequest("textDocument/completion", getCompletions(oni, host))
    lightweightLanguageClient.handleRequest("textDocument/codeAction", getCodeActions)
    lightweightLanguageClient.handleRequest("textDocument/definition", getDefinition(oni, host))
    lightweightLanguageClient.handleRequest("textDocument/hover",  getQuickInfo(oni, host))
    lightweightLanguageClient.handleRequest("textDocument/references",  findAllReferences(oni, host))
    lightweightLanguageClient.handleRequest("textDocument/signatureHelp",  getSignatureHelp(oni, host))

    lightweightLanguageClient.handleRequest("completionItem/resolve", getCompletionDetails(host))
}
