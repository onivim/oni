/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
*/

export type LanguageFilter = string

export const createLanguageClientsFromConfiguration = (configuration: { [key: string]: any }) => {

    const keys = Object.keys(configuration).filter((k) => k.indexOf("language.") === 0)




}

export class LanguageManager {

    public createLanguageClient(languageIdentifier: LanguageFilter, serverOptions: any, fileResolver?: string): any {
        return null
    }

}

export const languageManager = new LanguageManager()
