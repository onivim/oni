/**
 * LanguageClient.ts
 *
 * Handles Oni's client implementation of the Language Server Protocol:
 * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
 */

import * as _ from "lodash"
import * as rpc from "vscode-jsonrpc"
import * as types from "vscode-languageserver-types"

import { ChildProcess, exec } from "child_process"

import { getCompletionMeet } from "./../../../Services/AutoCompletionUtility"
import { Oni } from "./../Oni"

import * as Helpers from "./LanguageClientHelpers"
import { LanguageClientLogger } from "./LanguageClientLogger"

export interface LanguageClientInitializationParams {
    rootPath: string
}

/**
 * Function that takes an event (buffer-open event) and returns a language params
 * This should always return the same value for a particular file.
 */
export interface InitializationParamsCreator {
    (filePath: string): Promise<LanguageClientInitializationParams>
}

/**
 * Implementation of a client that talks to a server 
 * implementing the Language Server Protocol:
 * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
 */
export class LanguageClient {
    private _currentPromise: Promise<any>
    private _connection: rpc.MessageConnection
    private _process: ChildProcess
    private _currentOpenDocumentPath: string
    private _currentBuffer: string[] = []
    private _initializationParams: LanguageClientInitializationParams

    constructor(
        private _startCommand: string,
        private _initializationParamsCreator: InitializationParamsCreator,
        private _oni: Oni) {

        this._currentPromise = Promise.resolve(null)

        this._oni.on("buffer-enter", (args: Oni.EventContext) => {
            this._enqueuePromise(() => {
                return this._initializationParamsCreator(args.bufferFullPath)
                    .then((newParams: LanguageClientInitializationParams) => {

                        if (!this._initializationParams) {
                            this._initializationParams = newParams
                            return this.start(newParams)
                        }

                        if (!_.isEqual(this._initializationParams, newParams)) {
                            this._initializationParams = newParams

                            return this.end()
                                .then(() => this.start(newParams))
                        }

                        return null
                    })
            }, false)

            this._enqueuePromise(() => {
                return this._getHighlights(args)
                    .then((highlights: Oni.Plugin.SyntaxHighlight[]) => this._oni.setHighlights(args.bufferFullPath, "langservice", highlights))
            })
        })

        this._oni.on("buffer-update", (args: Oni.BufferUpdateContext) => {
            return this._enqueuePromise(() => this._onBufferUpdate(args))
        })

        this._oni.on("buffer-update-incremental", (args: Oni.IncrementalBufferUpdateContext) => {
            return this._enqueuePromise(() => this._onBufferUpdateIncremental(args))
        })

        const getQuickInfo = (textDocumentPosition: Oni.EventContext) => {
            return this._enqueuePromise(() => this._getQuickInfo(textDocumentPosition))
        }

        const getDefinition = (textDocumentPosition: Oni.EventContext) => {
            return this._enqueuePromise(() => this._getDefinition(textDocumentPosition))
        }

        const getCompletions = (textDocumentPosition: Oni.EventContext) => {
            return this._enqueuePromise(() => this._getCompletions(textDocumentPosition))
        }

        this._oni.registerLanguageService({
            getCompletions,
            getDefinition,
            getQuickInfo,
        })
    }

    public start(initializationParams: LanguageClientInitializationParams): Thenable<any> {

        // TODO: Pursue alternate connection mechanisms besides stdio - maybe Node IPC?
        this._process = exec(this._startCommand, { maxBuffer: 500 * 1024 * 1024 }, (err) => {
            if (err) {
                console.error(err)
                alert(err)
            }
        })

        this._connection = rpc.createMessageConnection(
            <any>(new rpc.StreamMessageReader(this._process.stdout)),
            <any>(new rpc.StreamMessageWriter(this._process.stdin)),
            new LanguageClientLogger())

        this._currentOpenDocumentPath = null

        this._connection.onNotification(Helpers.ProtocolConstants.Window.LogMessage, (args) => {
            console.log(JSON.stringify(args)) // tslint:disable-line no-console
        })

        this._connection.onNotification(Helpers.ProtocolConstants.Telemetry.Event, (args) => {
            console.log(JSON.stringify(args)) // tslint:disable-line no-console
        })

        this._connection.onNotification(Helpers.ProtocolConstants.Window.ShowMessage, (args) => {
            // TODO: Need alternate paradigm for showing a message
            alert(args)
        })

        // Register additional notifications here
        this._connection.listen()

        return this._connection.sendRequest(Helpers.ProtocolConstants.Initialize, initializationParams)
    }

    public end(): Promise<void> {
        console.warn("Closing current language service connection")
        this._connection.dispose()

        this._connection = null
        this._currentOpenDocumentPath = null
        return null
    }

    private _enqueuePromise<T>(functionThatReturnsPromiseOrThenable: () => Promise<T> | Thenable<T>, requireConnection: boolean = true): Promise<T> {

        const promiseExecutor = () => {
            if (!this._connection && requireConnection) {
                return Promise.reject("No active language server connection")
            }

            return functionThatReturnsPromiseOrThenable()
        }

        const newPromise = this._currentPromise
            .then(() => promiseExecutor(),
            (err) => {
                console.error(err)
                return promiseExecutor()
            })

        this._currentPromise = newPromise
        return newPromise
    }

    private _getCompletions(textDocumentPosition: Oni.EventContext): Thenable<Oni.Plugin.CompletionResult> {

        return this._connection.sendRequest(Helpers.ProtocolConstants.TextDocument.Completion,
            Helpers.eventContextToTextDocumentPositionParams(textDocumentPosition))
            .then((result: types.CompletionList) => {

                const currentLine = this._currentBuffer[textDocumentPosition.line - 1]
                const meetInfo = getCompletionMeet(currentLine, textDocumentPosition.column, /[_a-z]/i)

                if (!meetInfo) {
                    return { base: "", completions: [] }
                }

                const filteredItems = result.items.filter((item) => item.label.indexOf(meetInfo.base) === 0)

                const completions = filteredItems.map((i) => ({
                    label: i.label,
                    detail: i.detail,
                    documentation: i.documentation,
                    kind: this._mapCompletionKind(i.kind),
                }))

                return {
                    base: meetInfo.base,
                    completions,
                }
            })
    }

    private _mapCompletionKind(kind?: types.CompletionItemKind): string {

        if (!kind) {
            return null
        }

        switch (kind) {
            case types.CompletionItemKind.Text:
                return "text"
            case types.CompletionItemKind.Method:
                return "method"
            case types.CompletionItemKind.Function:
                return "function"
            case types.CompletionItemKind.Constructor:
                return "constructor"
            case types.CompletionItemKind.Variable:
            case types.CompletionItemKind.Field:
                return "var"
            case types.CompletionItemKind.Class:
                return "type"
            case types.CompletionItemKind.Interface:
                return "interface"
            case types.CompletionItemKind.Module:
                return "module"
            case types.CompletionItemKind.Property:
                return "property"
            case types.CompletionItemKind.Unit:
                return "unit"
            case types.CompletionItemKind.Value:
                return "const"
            case types.CompletionItemKind.Enum:
                return "type"
            case types.CompletionItemKind.Keyword:
                return "keyword"
            case types.CompletionItemKind.Snippet:
                return null
            case types.CompletionItemKind.Color:
                return "color"
            case types.CompletionItemKind.File:
                return "file"
            case types.CompletionItemKind.Reference:
                return "module"
            default:
                return null
        }
    }

    private _getQuickInfo(textDocumentPosition: Oni.EventContext): Thenable<Oni.Plugin.QuickInfo> {
        return this._connection.sendRequest(Helpers.ProtocolConstants.TextDocument.Hover,
            Helpers.eventContextToTextDocumentPositionParams(textDocumentPosition))
            .then((result: types.Hover) => {
                if (!result || !result.contents) {
                    throw "No quickinfo available"
                }

                let contents = result.contents.toString().trim()

                if (contents.length === 0) {
                    throw "Quickinfo data empty"
                }

                return { title: contents, description: "" }
            })
    }

    private _getDefinition(textDocumentPosition: Oni.EventContext): Thenable<Oni.Plugin.GotoDefinitionResponse> {
        return this._connection.sendRequest(Helpers.ProtocolConstants.TextDocument.Definition,
            Helpers.eventContextToTextDocumentPositionParams(textDocumentPosition))
            .then((result: types.Location) => {
                const startPos = result.range.start || result.range.end
                return {
                    filePath: Helpers.unwrapFileUriPath(result.uri),
                    line: startPos.line + 1,
                    column: startPos.character + 1,
                }
            })
    }

    private _getHighlights(textDocumentPosition: Oni.EventContext): Thenable<Oni.Plugin.SyntaxHighlight[]> {
        return this._connection.sendRequest(Helpers.ProtocolConstants.TextDocument.DocumentSymbol, {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(textDocumentPosition.bufferFullPath),
            },
        }).then((/* result: types.SymbolInformation[]*/) => {
            // TODO
            return []
        })
    }

    private _onBufferUpdateIncremental(args: Oni.IncrementalBufferUpdateContext): Thenable<void> {
        if (!args.eventContext.bufferFullPath) {
            return Promise.resolve(null)
        }

        const changedLine = args.bufferLine
        const lineNumber = args.lineNumber

        const previousLine = this._currentBuffer[lineNumber - 1]

        this._currentBuffer[lineNumber - 1] = changedLine

        this._connection.sendNotification(Helpers.ProtocolConstants.TextDocument.DidChange,
            Helpers.incrementalBufferUpdateToDidChangeTextDocumentParams(args, previousLine))

        return Promise.resolve(null)
    }

    private _onBufferUpdate(args: Oni.BufferUpdateContext): Thenable<void> {
        const lines = args.bufferLines
        const { bufferFullPath } = args.eventContext

        this._currentBuffer = lines

        if (this._currentOpenDocumentPath !== bufferFullPath) {
            this._currentOpenDocumentPath = bufferFullPath
            this._connection.sendNotification("textDocument/didOpen", {
                textDocument: Helpers.bufferUpdateToTextDocumentItem(args),
            })
        } else {
            this._connection.sendNotification(Helpers.ProtocolConstants.TextDocument.DidChange,
                Helpers.bufferUpdateToDidChangeTextDocumentParams(args))
        }

        return Promise.resolve(null)
    }
}
