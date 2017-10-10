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

import { ILanguageClientProcess } from "./LanguageClientProcess"

import { LanguageClient2 } from "./LanguageClient2"

export class LanguageManager {

    private _languageServerInfo: { [language: string]: LanguageClient2 } = {}

    constructor() {
        editorManager.allEditors.onBufferEnter.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            const { language, filePath } = bufferInfo

            const languageClient = this.getLanguageClient(language)

            if (languageClient) {
                // TODO: Make this work... maybe just blank text for now
                // 
                languageClient.sendNotification(filePath, "test", null)
            }

            console.log("Buffer enter: " + bufferInfo.filePath)
        })

        editorManager.allEditors.onBufferLeave.subscribe((bufferInfo: Oni.EditorBufferEventArgs) => {
            console.log("Buffer leave: " + bufferInfo.filePath)
        })
    }

    // TODO: Should this even be public?
    public getLanguageClient(language: string): LanguageClient2 {
        return this._languageServerInfo[language]
    }

    public registerLanguageClientFromProcess(language: string, languageProcess: ILanguageClientProcess): any {

        if (this._languageServerInfo[language]) {
            Log.error("Duplicate language server registered for: " + language)
            return
        }

        this._languageServerInfo[language] = new LanguageClient2(languageProcess)
    }

}

export const languageManager = new LanguageManager()
