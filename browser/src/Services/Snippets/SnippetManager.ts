/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import * as Snippets from "vscode-snippet-parser/lib"

import { editorManager, EditorManager } from "./../EditorManager"

import { SnippetSession } from "./SnippetSession"

export class SnippetManager {

    private _snippetParser: Snippets.SnippetParser

    constructor(
        private _editorManager: EditorManager,
    ) {
        this._snippetParser = new Snippets.SnippetParser()
    }

    /**
     * Inserts snippet in the active editor, at current cursor position
     */
    public async insertSnippet(snippet: string): Promise<void> {

        const parsedSnippet = this._snippetParser.parse(snippet)

        const activeEditor = this._editorManager.activeEditor
        const snippetSession = new SnippetSession(activeEditor, parsedSnippet)
        await snippetSession.start()
    }
}

let _snippetManager: SnippetManager

export const activate = () => {
    _snippetManager = new SnippetManager(editorManager)
}

export const getInstance = (): SnippetManager => {
    return _snippetManager
}
