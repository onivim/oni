/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import { editorManager, EditorManager } from "./../EditorManager"

import { SnippetSession } from "./SnippetSession"
import { OniSnippet } from "./OniSnippet"

export class SnippetManager {

    constructor(
        private _editorManager: EditorManager,
    ) { }

    /**
     * Inserts snippet in the active editor, at current cursor position
     */
    public async insertSnippet(snippet: string): Promise<void> {

        const snip = new OniSnippet(snippet)

        const activeEditor = this._editorManager.activeEditor
        const snippetSession = new SnippetSession(activeEditor, snip)
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
