/**
 * LanguageManager
 *
 * Service for integrating language services, like:
 *  - Language server protocol
 *  - Synchronizing language configuration
 *  - Handling custom syntax (TextMate themes)
*/

export type LanguageFilter = string

export class LanguageManager {

    public createLanguageClient(languageIdentifier: LanguageFilter, serverOptions: any, fileResolver?: string): any {
        return null
    }

}

export const languageManager = new LanguageManager()
