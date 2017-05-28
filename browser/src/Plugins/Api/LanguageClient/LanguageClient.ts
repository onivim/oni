/**
 * LanguageClient.ts
 *
 * Handles Oni's client implementation of the Language Server Protocol:
 * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
 */

import * as os from "os"

import * as _ from "lodash"
import * as rpc from "vscode-jsonrpc"
import * as types from "vscode-languageserver-types"

import { ChildProcess, spawn } from "child_process"

import { getCompletionMeet } from "./../../../Services/AutoCompletionUtility"
import { Oni } from "./../Oni"

import * as Helpers from "./LanguageClientHelpers"
import { LanguageClientLogger } from "./LanguageClientLogger"

/**
 * Options for starting the Language Server process
 */
export interface ServerRunOptions {
    /**
     * Specify `command` to use a shell command to spawn a process
     */
    command?: string

    /**
     * Specify `module` to run a JavaScript module
     */
    module?: string

    /**
     * Arguments to pass to the language servicew
     */
    args?: string[]

    // TODO: TransportKind option?
}

/**
 * Options to send to the `initialize` method of the 
 * Language Server
 */
export interface LanguageClientInitializationParams {
    clientName: string
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
    private _serverCapabilities: Helpers.ServerCapabilities

    constructor(
        private _startOptions: ServerRunOptions,
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
        const startArgs = this._startOptions.args || []

        if (this._startOptions.command) {
            this._process = spawn(this._startOptions.command, startArgs)
        } else if (this._startOptions.module) {
            this._process = this._oni.spawnNodeScript(this._startOptions.module, startArgs)
        } else {
            throw "A command or module must be specified to start the server"
        }

        this._connection = rpc.createMessageConnection(
            <any>(new rpc.StreamMessageReader(this._process.stdout)),
            <any>(new rpc.StreamMessageWriter(this._process.stdin)),
            new LanguageClientLogger())

        this._currentOpenDocumentPath = null
        this._serverCapabilities = null

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

        this._connection.onNotification(Helpers.ProtocolConstants.TextDocument.PublishDiagnostics, (args) => {
            const diagnostics: types.Diagnostic[] = args.diagnostics

            const oniDiagnostics = diagnostics.map((d) => ({
                type: null,
                text: d.message,
                lineNumber: d.range.start.line + 1,
                startColumn: d.range.start.character + 1,
                endColumn: d.range.end.character + 1,
            }))

            this._oni.diagnostics.setErrors(this._initializationParams.clientName, Helpers.unwrapFileUriPath(args.uri), oniDiagnostics, "red")
        })

        // Register additional notifications here
        this._connection.listen()

        return this._connection.sendRequest(Helpers.ProtocolConstants.Initialize, initializationParams)
            .then((response: any) => {
                console.log(`[LANGUAGE CLIENT: ${initializationParams.clientName}]: Initialized`) // tslint:disable-line no-console
                if (response && response.capabilities) {
                    this._serverCapabilities = response.capabilities
                }
            }, (err) => console.error(err))
    }

    public end(): Promise<void> {
        console.warn("Closing current language service connection")
        this._connection.dispose()

        this._connection = null
        this._currentOpenDocumentPath = null
        return Promise.resolve(null)
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
                    kind: i.kind,
                }))

                return {
                    base: meetInfo.base,
                    completions,
                }
            })
    }

    private _getQuickInfo(textDocumentPosition: Oni.EventContext): Thenable<Oni.Plugin.QuickInfo> {
        return this._connection.sendRequest(Helpers.ProtocolConstants.TextDocument.Hover,
            Helpers.eventContextToTextDocumentPositionParams(textDocumentPosition))
            .then((result: types.Hover) => {
                if (!result || !result.contents) {
                    return null
                }

                let contents = Helpers.getTextFromContents(result.contents)

                if (contents.length === 0) {
                    return null
                } else if (contents.length === 1 && contents[0]) {
                    const title = contents[0].trim()

                    if (!title) {
                        return null
                    }

                    return {
                        title,
                        description: "",
                    }
                } else {

                    const description = [...contents]
                    description.shift()
                    const descriptionContent = description.join(os.EOL)

                    return {
                        title: contents[0],
                        description: descriptionContent,
                    }
                }
            })
    }

    private _getDefinition(textDocumentPosition: Oni.EventContext): Thenable<Oni.Plugin.GotoDefinitionResponse> {
        return this._connection.sendRequest(Helpers.ProtocolConstants.TextDocument.Definition,
            Helpers.eventContextToTextDocumentPositionParams(textDocumentPosition))
            .then((result: types.Location & types.Location[]) => {
                if (!result) {
                    return null
                }

                let location: types.Location = result
                if (result.length) {
                    location = result[0]
                }

                const startPos = location.range.start || location.range.end
                return {
                    filePath: Helpers.unwrapFileUriPath(location.uri),
                    line: startPos.line + 1,
                    column: startPos.character + 1,
                }
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

        if (this._serverCapabilities && this._serverCapabilities.textDocumentSync) {
            let changeTextDocumentParams

            if (this._serverCapabilities.textDocumentSync === Helpers.TextDocumentSyncKind.Full) {
                changeTextDocumentParams = Helpers.createDidChangeTextDocumentParams(args.eventContext.bufferFullPath, this._currentBuffer, args.eventContext.version)
            } else {
                changeTextDocumentParams = Helpers.incrementalBufferUpdateToDidChangeTextDocumentParams(args, previousLine)
            }

            this._connection.sendNotification(Helpers.ProtocolConstants.TextDocument.DidChange, changeTextDocumentParams)
        }

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
                Helpers.createDidChangeTextDocumentParams(bufferFullPath, lines, args.eventContext.version))
        }

        return Promise.resolve(null)
    }
}
