/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import { editorManager, EditorManager } from "./../EditorManager"

import { SnippetSession } from "./SnippetSession"
import { OniSnippet } from "./OniSnippet"

export class SnippetManager {

    private _activeSession: SnippetSession

    constructor(
        private _editorManager: EditorManager,
    ) { }

    /**
     * Inserts snippet in the active editor, at current cursor position
     */
    public async insertSnippet(snippet: string): Promise<void> {

        const snip = new OniSnippet(snippet)

        const activeEditor = this._editorManager.activeEditor
        const snippetSession = new SnippetSession(activeEditor as any, snip)
        await snippetSession.start()

        this._activeSession = snippetSession
    }

    private _isSnippetActive(): boolean {
        return !!this._activeSession
    }

    public nextPlaceholder(): void {
        if (this._isSnippetActive()) {
            this._activeSession.nextPlaceholder()
        }
    }
}

let _snippetManager: SnippetManager

export const activate = () => {
    _snippetManager = new SnippetManager(editorManager)
}

export const getInstance = (): SnippetManager => {
    return _snippetManager
}
