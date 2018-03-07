/**
 * UserSnippetProvider.ts
 *
 * Manages loading user snippets, and opening user snippet files
 */

import * as fs from "fs"
import * as path from "path"

import * as mkdirp from "mkdirp"
import * as Oni from "oni-api"

import { loadSnippetsFromFile } from "./SnippetProvider"

import { CommandManager } from "./../CommandManager"
import { Configuration, getUserConfigFolderPath } from "./../Configuration"
import { EditorManager } from "./../EditorManager"

import * as Log from "./../../Log"

const GLOBAL_SNIPPET_NAME = "global_snippets"

const SnippetTemplate = [
    "{",
    '   "For_Loop": {',
    '       "prefix": "for",',
    '       "body": [',
    '         "for (const ${2:element} of ${1:array}) {",', // tslint:disable-line
    '         "\\t$0",', //tslint:disable-line
    '         "}"',
    "       ],",
    '       "description": "For Loop"',
    "   },",
    "}",
]

export class UserSnippetProvider implements Oni.Snippets.SnippetProvider {
    private _snippetCache: { [language: string]: Oni.Snippets.Snippet[] } = {}
    private _isWatching: boolean = false

    private _fileTypesToEditSnippets: Set<string> = new Set<string>()

    constructor(
        private _commandManager: CommandManager,
        private _configuration: Configuration,
        private _editorManager: EditorManager,
    ) {
        this._startWatchingSnippetsFolderIfExists()

        this._editorManager.anyEditor.onBufferEnter.subscribe(bufEnter => {
            this._addCommandForLanguage(bufEnter.language)
        })

        this._commandManager.registerCommand({
            command: "userSnippets.editGlobal",
            name: "Snippets: Edit User Snippets (global)",
            detail: "Edit user snippet definitions for all files.",
            execute: () => this._editSnippetFile(GLOBAL_SNIPPET_NAME),
        })
    }

    public async getSnippets(language: string): Promise<Oni.Snippets.Snippet[]> {
        const globalSnippets = await this._getSnippetForLanguage(GLOBAL_SNIPPET_NAME)
        const languageSnippets = await this._getSnippetForLanguage(language)

        return [...globalSnippets, ...languageSnippets]
    }

    public getUserSnippetFilePath(language: string): string {
        const snippetPath = this._getSnippetFolder()
        return path.join(snippetPath, language + ".json")
    }

    private _addCommandForLanguage(language: string): void {
        if (!this._fileTypesToEditSnippets.has(language)) {
            this._commandManager.registerCommand({
                command: `userSnippets.edit.${language}`,
                name: `Snippets: Edit User Snippets (${language})`,
                detail: `Edit user snippet definitions for ${language} files.`,
                execute: () => this._editSnippetFile(language),
                enabled: () => this._editorManager.activeEditor.activeBuffer.language === language,
            })

            this._fileTypesToEditSnippets.add(language)
        }
    }

    private async _editSnippetFile(language: string): Promise<void> {
        // Make sure snippet folder exists
        const snippetFilePath = this.getUserSnippetFilePath(language)
        const snippetFolder = path.dirname(snippetFilePath)

        mkdirp.sync(snippetFolder)
        this._startWatchingSnippetsFolderIfExists()

        const isNewFile = !fs.existsSync(snippetFilePath)

        const buf = await this._editorManager.activeEditor.openFile(snippetFilePath, {
            openMode: Oni.FileOpenMode.VerticalSplit,
        })

        if (isNewFile) {
            await buf.setLines(0, 1, SnippetTemplate)
        }
    }

    private _startWatchingSnippetsFolderIfExists(): void {
        if (this._isWatching) {
            return
        }

        if (!fs.existsSync(this._getSnippetFolder())) {
            return
        }

        Log.info("UserSnippetProvider - installing watcher...")

        this._isWatching = true

        fs.watch(this._getSnippetFolder(), (evt, filename) => {
            Log.info("UserSnippetProvider - invalidating cache because a change was detected.")
            this._snippetCache = {}
        })
    }

    private _getSnippetFolder(): string {
        return (
            this._configuration.getValue("snippets.userSnippetFolder") ||
            path.join(getUserConfigFolderPath(), "snippets")
        )
    }

    private async _getSnippetForLanguage(language: string): Promise<Oni.Snippets.Snippet[]> {
        if (this._snippetCache[language]) {
            return this._snippetCache[language]
        }

        const filePath = this.getUserSnippetFilePath(language)

        let snippets: Oni.Snippets.ISnippet[] = []
        if (fs.existsSync(filePath)) {
            snippets = await loadSnippetsFromFile(filePath)
        }

        this._snippetCache[language] = snippets
        return snippets
    }
}
