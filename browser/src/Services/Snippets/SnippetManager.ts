/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import { IDisposable } from "oni-types"

import * as Log from "./../../Log"

import { Subject } from "rxjs/Subject"
import "rxjs/add/operator/auditTime"

import { CommandManager } from "./../CommandManager"
import { editorManager, EditorManager } from "./../EditorManager"

import { OniSnippet } from "./OniSnippet"
import { SnippetSession } from "./SnippetSession"

export class SnippetManager {
    private _activeSession: SnippetSession
    private _disposables: IDisposable[] = []

    private _synchronizeSnippetObseravble: Subject<void> = new Subject<void>()

    constructor(private _editorManager: EditorManager) {
        this._synchronizeSnippetObseravble.auditTime(50).subscribe(() => {
            const activeEditor = this._editorManager.activeEditor as any
            const activeSession = this._activeSession

            if (activeEditor && activeSession) {
                activeEditor.blockInput(() => activeSession.synchronizeUpdatedPlaceholders())
            }
        })
    }

    /**
     * Inserts snippet in the active editor, at current cursor position
     */
    public async insertSnippet(snippet: string): Promise<void> {
        this.cancel()
        Log.info("[SnippetManager::insertSnippet]")

        const snip = new OniSnippet(snippet)

        const activeEditor = this._editorManager.activeEditor as any
        const snippetSession = new SnippetSession(activeEditor as any, snip)
        await snippetSession.start()

        const s2 = activeEditor.onBufferChanged.subscribe(() => {
            this._synchronizeSnippetObseravble.next()
        })

        const s3 = snippetSession.onCancel.subscribe(() => {
            this.cancel()
        })

        this._disposables = [s2, s3]

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

    public cancel(): void {
        if (this._activeSession) {
            this._cleanupAfterSession()
        }
    }

    private _cleanupAfterSession(): void {
        Log.info("[SnippetManager::cancel]")
        this._disposables.forEach(d => d.dispose())
        this._disposables = []
        this._activeSession = null
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

    commandManager.registerCommand({
        command: "snippet.cancel",
        name: null,
        detail: null,
        enabled: () => _snippetManager.isSnippetActive(),
        execute: () => _snippetManager.cancel(),
    })
}

export const getInstance = (): SnippetManager => {
    return _snippetManager
}
