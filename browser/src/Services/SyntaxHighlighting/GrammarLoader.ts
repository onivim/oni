import { IGrammar, Registry } from "vscode-textmate"

import { configuration } from "./../Configuration"

export interface IGrammarLoader {
    getGrammarForLanguage(language: string): Promise<IGrammar>
}

export const getPathForLanguage = (language: string): string => {
    const textMatePath = configuration.getValue("language." + language + ".textMateGrammar")

    return textMatePath || null
}

export class GrammarLoader implements IGrammarLoader {

    private _grammarCache: { [language: string]: IGrammar } = {}

    constructor(
        private _registry: Registry = new Registry(),
    ) {}

    public async getGrammarForLanguage(language: string): Promise<IGrammar> {

        if (!language) {
            return null
        }

        if (this._grammarCache[language]) {
            return this._grammarCache[language]
        }

        const filePath = getPathForLanguage(language)

        if (!filePath) {
            return null
        }

        const grammar = this._registry.loadGrammarFromPathSync(filePath)

        this._grammarCache[language] = grammar

        return grammar
    }
}
