import { IGrammar, Registry } from "vscode-textmate"

import { configuration } from "./../Configuration"

export interface IGrammarLoader {
    getGrammarForLanguage(language: string, extension: string): Promise<IGrammar>
}

export interface ExtensionToGrammarMap { [extension: string]: string }

export const getPathForLanguage = (language: string, extension: string): string => {
    const grammar: string | ExtensionToGrammarMap = configuration.getValue("language." + language + ".textMateGrammar")

    if (typeof grammar === "string") {
        return grammar
    } else {
        return grammar[extension] || null
    }
}

export class GrammarLoader implements IGrammarLoader {

    private _grammarCache: { [language: string]: IGrammar } = {}

    constructor(
        private _registry: Registry = new Registry(),
    ) {}

    public async getGrammarForLanguage(language: string, extension: string): Promise<IGrammar> {

        if (!language) {
            return null
        }

        if (this._grammarCache[language]) {
            return this._grammarCache[language]
        }

        const filePath = getPathForLanguage(language, extension)

        if (!filePath) {
            return null
        }

        const grammar = this._registry.loadGrammarFromPathSync(filePath)

        this._grammarCache[language] = grammar

        return grammar
    }
}
