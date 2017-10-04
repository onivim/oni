/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
*/

import * as Log from "./../../Log"

import { editorManager } from "./../EditorManager"

export type PathResolver = (filePath: string) => Promise<string>

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

    workingDirectory?: PathResolver
}

export interface InitializationOptions {
    rootPath: PathResolver
}

export class PromiseQueue {
    private _currentPromise: Promise<any> = Promise.resolve(null)

    public enqueuePromise<T>(functionThatReturnsPromiseOrThenable: () => Promise<T> | Thenable<T>, requireConnection: boolean = true): Promise<T> {

        const promiseExecutor = () => {
            return functionThatReturnsPromiseOrThenable()
        }

        const newPromise = this._currentPromise
            .then(() => promiseExecutor(),
            (err) => {
                Log.error(err)
                return promiseExecutor()
            })

        this._currentPromise = newPromise
        return newPromise
    }
}

export class LanguageClient {

    private _promiseQueue: PromiseQueue = new PromiseQueue()
    private _languageClientProcess: LanguageClientProcess

    constructor(
        serverOptions: ServerRunOptions,
        initializationOptions: InitializationOptions) {
        this._languageClientProcess = new LanguageClientProcess(serverOptions, initializationOptions)
    }

    public sendRequest<T>(requestName: string, protocolArguments: any): Promise<T> {
        return this._promiseQueue.enqueuePromise(() => {
            return Promise.resolve(null)
        })
    }

    public sendNotification(notificationName: string, protocolArguments: any): void {
        this._promiseQueue.enqueuePromise(() => {

        })
    }
}

export class LanguageManager {

    private _languageServerInfo: { [language: string]: LanguageClient } = {}

    constructor() {
        editorManager.allEditors.onBufferEnter.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            console.log("Buffer enter: " + bufferInfo.filePath)
        })

        editorManager.allEditors.onBufferLeave.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            console.log("Buffer leave: " + bufferInfo.filePath)
        })
    }

    public getLanguageClient(language: string): LanguageClient {
        return this._languageServerInfo[language]
    }

    public createLanguageClient(language: string, serverOptions: ServerRunOptions, initializationOptions: InitializationOptions): any {

        if (this._languageServerInfo[language]) {
            Log.error("Duplicate language server registered for: " + language)
            return
        }

        this._languageServerInfo[language] = new LanguageClient(serverOptions, initializationOptions)
    }

}

export const languageManager = new LanguageManager()
