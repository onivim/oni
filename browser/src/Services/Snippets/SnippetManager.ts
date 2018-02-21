/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import { CommandManager } from "./../CommandManager"
import { editorManager, EditorManager } from "./../EditorManager"

import { OniSnippet } from "./OniSnippet"
import { SnippetSession } from "./SnippetSession"

export class SnippetManager {
    private _activeSession: SnippetSession

    constructor(private _editorManager: EditorManager) {}

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

    public nextPlaceholder(): void {
        if (this.isSnippetActive()) {
            this._activeSession.nextPlaceholder()
        }
    }

    public previousPlaceholder(): void {
        if (this.isSnippetActive()) {
            this._activeSession.previousPlaceholder()
        }
    }

    public isSnippetActive(): boolean {
        return !!this._activeSession
    }
}

let _snippetManager: SnippetManager

export const activate = (commandManager: CommandManager) => {
    _snippetManager = new SnippetManager(editorManager)

    commandManager.registerCommand({
        command: "snippet.nextPlaceholder",
        name: null,
        detail: null,
        enabled: () => _snippetManager.isSnippetActive(),
        execute: () => _snippetManager.nextPlaceholder(),
    })

    commandManager.registerCommand({
        command: "snippet.previousPlaceholder",
        name: null,
        detail: null,
        enabled: () => _snippetManager.isSnippetActive(),
        execute: () => _snippetManager.previousPlaceholder(),
    })
}

export const getInstance = (): SnippetManager => {
    return _snippetManager
}
