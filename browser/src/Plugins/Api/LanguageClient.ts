/**
 * LanguageClient.ts
 *
 * Handles Oni's client implementation of the Language Server Protocol:
 * https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
 */

import * as os from "os"

import * as rpc from "vscode-jsonrpc"
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

        this._oni.registerLanguageService({
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


    private _getQuickInfo(textDocumentPosition: Oni.EventContext): Promise<Oni.Plugin.QuickInfo> {
        return <any>this._connection.sendRequest("textDocument/hover", {
            textDocument: {
                uri: wrapPathInFileUri(textDocumentPosition.bufferFullPath)
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
