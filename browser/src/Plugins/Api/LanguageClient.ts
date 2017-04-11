/**
 * LanguageClient.ts
 *
 * Handles Oni's client implementation of the Language Server Protocol:
 * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
 */

import * as os from "os"

import * as rpc from "vscode-jsonrpc"
import * as types from "vscode-languageserver-types"

import { exec, ChildProcess } from "child_process"

import { Oni } from "./Oni"

export interface LanguageClientInitializationParams {
    rootPath: string
}

export class LanguageClientLogger {
    public error(message: string): void {
        console.error(message)
    }

    public warn(message: string): void {
        console.warn(message)
    }

    public info(message: string): void {
        console.log(message)
    }

    public log(message: string): void {
        console.log(message)
    }
}

const wrapPathInFileUri = (path: string) => "file:///" + path

const unwrapFileUriPath = (uri: string) => decodeURIComponent((uri).split("file:///")[1])

/**
 * Implementation of a client that talks to a server 
 * implement the Language Server Protocol
 */
export class LanguageClient {
    private _currentPromise: Promise<any>
    private _connection: rpc.MessageConnection
    private _process: ChildProcess
    private _currentOpenDocumentPath: string

    constructor(
        private _startCommand: string,
        private _initializationParams: LanguageClientInitializationParams,
        private _oni: Oni) {

        this._currentPromise = Promise.resolve(null)

        this._oni.on("buffer-update", (args: any) => {
            return this._enqueuePromise(() => this._onBufferUpdate(args))
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

    public start(): Promise<any> {

        return <any>this._enqueuePromise(() => {
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

            this._connection.onNotification("window/logMessage", (args) => {
                console.log(JSON.stringify(args))
            })

            this._connection.onNotification("telemetry/event", (args) => {
                console.log(JSON.stringify(args))
            })

            this._connection.onNotification("window/showMessage", (args) => {
                alert(args)
            })


            // Register additional notifications here
            this._connection.listen()

            return <any>this._connection.sendRequest("initialize", this._initializationParams)
        }, false)
    }

    private _enqueuePromise<T>(functionThatReturnsPromise: () => Promise<T>, requireConnection: boolean = true): Promise<T> {

        const promiseExecutor = () => {
            if (!this._connection && requireConnection) {
                return Promise.reject("No active language server connection")
            }

            return functionThatReturnsPromise()
        }

        return this._currentPromise
            .then(() => promiseExecutor(),
            (err) => {
                console.error(err)
                promiseExecutor()
            })
    }

    private _getCompletions(textDocumentPosition: Oni.EventContext): Promise<Oni.Plugin.CompletionResult> {

        return <any>this._connection.sendRequest("textDocument/completion", {
            textDocument: {
                uri: wrapPathInFileUri(textDocumentPosition.bufferFullPath),
            },
            position: {
                line: textDocumentPosition.line - 1,
                character: textDocumentPosition.column - 1
            }
        }).then((result: types.CompletionList) => {
            const completions = result.items.map((i) => ({
                label: i.label,
                detail: i.detail,
                documentation: i.documentation,
                kind: this._mapCompletionKind(i.kind)
            }))
            // debugger
            return {
                base: "",
                completions 
            }
        })
    }

    private _mapCompletionKind(kind?: types.CompletionItemKind): string {

        if (!kind) {
            return null
        }

        switch(kind) {
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

    private _getQuickInfo(textDocumentPosition: Oni.EventContext): Promise<Oni.Plugin.QuickInfo> {
        return <any>this._connection.sendRequest("textDocument/hover", {
            textDocument: {
                uri: wrapPathInFileUri(textDocumentPosition.bufferFullPath),
            },
            position: {
                line: textDocumentPosition.line - 1,
                character: textDocumentPosition.column - 1
            }
        }).then((result: any) => {
            if (!result || !result.contents || result.contents.trim().length === 0) {
                throw "No quickinfo available"
            }

            return { title: result.contents.trim(), description: "" }
        })
    }

    private _getDefinition(textDocumentPosition: Oni.EventContext): Promise<Oni.Plugin.GotoDefinitionResponse> {

        // TODO: Refactor the params
        return <any>this._connection.sendRequest("textDocument/definition", {
            textDocument: {
                uri: wrapPathInFileUri(textDocumentPosition.bufferFullPath),
            },
            position: {
                line: textDocumentPosition.line - 1,
                character: textDocumentPosition.column - 1
            }
        }).then((result: any) => {
            const startPos = result.range.start || result.range.end
            return {
                filePath: unwrapFileUriPath(result.uri),
                line: startPos.line + 1,
                column: startPos.character + 1,
            }
        })

    }

    // TODO: Type for this args
    private _onBufferUpdate(args: any): Promise<void> {
        const lines = args.bufferLines
        const { bufferFullPath, filetype, version } = args.eventContext
        const text = lines.join(os.EOL)

        if (this._currentOpenDocumentPath !== bufferFullPath) {
            this._currentOpenDocumentPath = bufferFullPath
            return <any>this._connection.sendNotification("textDocument/didOpen", {
                textDocument: {
                    uri: wrapPathInFileUri(bufferFullPath),
                    languageId: filetype,
                    version,
                    text,
                }
            })
        } else {
            return <any>this._connection.sendNotification("textDocument/didChange", {
                textDocument: {
                    uri: wrapPathInFileUri(bufferFullPath),
                    version,
                },
                contentChanges: [{
                    text
                }]
            })
        }
    }
}
