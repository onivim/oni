/**
 * SnippetProvider.ts
 *
 * Manages snippet integration
 */

import * as fs from "fs"
import * as os from "os"

import * as Log from "./../../Log"

import { ISnippet } from "./ISnippet"
import { ISnippetProvider } from "./SnippetProvider"

import { Configuration, getUserConfigFolderPath } from "./../Configuration"
import { promisify } from "util"

const fileExists = promisify(fs.exists)
const readFile = promisify(fs.readFile)

const GLOBAL_SNIPPET_NAME = "global_snippets"

export class UserSnippetProvider implements ISnippetProvider {
    private _snippetCache: { [language: string]: ISnippet[] } = {}

    constructor(private _configuration: Configuration) {}

    public async getSnippets(language: string): Promise<ISnippet[]> {
        const globalSnippets = await this._getSnippetForLanguage(GLOBAL_SNIPPET_NAME)
        const languageSnippets = await this._getSnippetForLanguage(language)

        return [...globalSnippets, ...languageSnippets]
    }

    private async _getSnippetForLanguage(language: string): Promise<ISnippet[]> {
        if (this._snippetCache[language]) {
            return this._snippetCache[language]
        }

        const filePath = this._getUserSnippetFilePath(language)
        const exists = await fileExists(filePath)

        if (exists) {
            const contents = await readFile(filePath)
            const snippets = JSON.parse(contents.toString())
            this._snippetCache[language] = snippets
            return snippets
        } else {
            return []
        }
    }

    private _getUserSnippetFilePath(language: string): string {
        const snippetPath =
            this._configuration.getValue("snippets.userSnippetFolder") ||
            path.join(getUserConfigFolderPath(), "snippets")

        return path.join(snippetPath, language + ".json")
    }
}
