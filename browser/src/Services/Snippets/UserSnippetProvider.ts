/**
 * UserSnippetProvider.ts
 *
 * Manages loading user snippets, and opening user snippet files
 */

import * as fs from "fs"
import * as path from "path"

import { ISnippet } from "./ISnippet"
import { ISnippetProvider } from "./SnippetProvider"

import { CommandManager } from "./../CommandManager"
import { Configuration, getUserConfigFolderPath } from "./../Configuration"
import { EditorManager } from "./../EditorManager"

import * as Log from "./../../Log"

import { promisify } from "util"

const fileExists = promisify(fs.exists)
const readFile = promisify(fs.readFile)

const GLOBAL_SNIPPET_NAME = "global_snippets"

export class UserSnippetProvider implements ISnippetProvider {
    private _snippetCache: { [language: string]: ISnippet[] } = {}

    constructor(
        private _commandManager: CommandManager,
        private _configuration: Configuration,
        private _editorManager: EditorManager,
    ) {
        this._editorManager.anyEditor.onBufferSaved.subscribe(saveEvent => {
            // Invalidate snippet cache if the snippets were saved
            if (saveEvent.filePath.indexOf(this._getSnippetFolder()) >= 0) {
                Log.info("UserSnippetProvider - invalidating cache.")
                this._snippetCache = {}
            }
        })

        this._commandManager.registerCommand({
            name: "Snippets: Edit User Snippets (global)",
            detail: "Edit user snippet definitions for all files.",
            execute: () => alert("edit definitions"),
        })
    }

    public async getSnippets(language: string): Promise<ISnippet[]> {
        const globalSnippets = await this._getSnippetForLanguage(GLOBAL_SNIPPET_NAME)
        const languageSnippets = await this._getSnippetForLanguage(language)

        return [...globalSnippets, ...languageSnippets]
    }

    public getUserSnippetFilePath(language: string): string {
        const snippetPath = this._getSnippetFolder()
        return path.join(snippetPath, language + ".json")
    }

    private _getSnippetFolder(): string {
        return (
            this._configuration.getValue("snippets.userSnippetFolder") ||
            path.join(getUserConfigFolderPath(), "snippets")
        )
    }

    private async _getSnippetForLanguage(language: string): Promise<ISnippet[]> {
        if (this._snippetCache[language]) {
            return this._snippetCache[language]
        }

        const filePath = this.getUserSnippetFilePath(language)
        const exists = await fileExists(filePath)

        let snippets = []
        if (exists) {
            const contents = await readFile(filePath)
            snippets = JSON.parse(contents.toString())
        }

        this._snippetCache[language] = snippets
        return snippets
    }
}
