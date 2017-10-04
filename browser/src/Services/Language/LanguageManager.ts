/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
*/

import * as Config from "./../../Config"
import * as Log from "./../../Log"

// TODO: Factor out configuration pieces to separate file

export interface ILanguageConfiguration {
    languageServer?: ILanguageServerConfiguration
}

export interface ILanguageServerConfiguration {
    command?: string
}

export class LanguageManager {

    public createLanguageClientFromConfig(language: string, config: ILanguageConfiguration): void {
        Log.info(`[Language Manager] Registering info for language: ${language} - command: ${config.languageServer.command}`)
    }

    public createLanguageClient(languageIdentifier: string, serverOptions: any, fileResolver?: string): any {

        const value = expandLanguageConfiguration({
            "language.go.languageServerPath": "test1",
            "language.go.textMateTheme": "test2",
            "language.typescript.languageServer.command": "test3",
        })
        return value
    }

}
