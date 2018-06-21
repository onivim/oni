/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { IDisposable } from "oni-types"

import "rxjs/add/operator/auditTime"
import { Subject } from "rxjs/Subject"

import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"

import { SnippetBufferLayer } from "./SnippetBufferLayer"
import { CompositeSnippetProvider } from "./SnippetProvider"
import { SnippetSession } from "./SnippetSession"

export class SnippetManager implements Oni.Snippets.SnippetManager {
    private _activeSession: SnippetSession
    private _disposables: IDisposable[] = []
    private _currentLayer: SnippetBufferLayer = null

    private _snippetProvider: CompositeSnippetProvider
    private _synchronizeSnippetObservable: Subject<void> = new Subject<void>()

    public get isSnippetActive(): boolean {
        return !!this._activeSession
    }

    constructor(private _configuration: Configuration, private _editorManager: EditorManager) {
        this._snippetProvider = new CompositeSnippetProvider(this._configuration)

        this._synchronizeSnippetObservable.auditTime(50).subscribe(() => {
            const activeEditor = this._editorManager.activeEditor as any
            const activeSession = this._activeSession

            if (activeEditor && activeSession) {
                activeEditor.blockInput(() => activeSession.synchronizeUpdatedPlaceholders())
            }
        })
    }

    public async getSnippetsForLanguage(language: string): Promise<Oni.Snippets.Snippet[]> {
        return this._snippetProvider.getSnippets(language)
    }

    public registerSnippetProvider(snippetProvider: Oni.Snippets.SnippetProvider): void {
        this._snippetProvider.registerProvider(snippetProvider)
    }

    /**
     * Inserts snippet in the active editor, at current cursor position
     */
    public async insertSnippet(snippet: string): Promise<void> {
        this.cancel()
        Log.info("[SnippetManager::insertSnippet]")

        const activeEditor = this._editorManager.activeEditor as any
        const snippetSession = new SnippetSession(activeEditor as any, snippet)
        await snippetSession.start()

        const buffer = this._editorManager.activeEditor.activeBuffer
        this._currentLayer = new SnippetBufferLayer(buffer, snippetSession)

        const s1 = activeEditor.onCursorMoved.subscribe(() => {
            if (this.isSnippetActive) {
                this._activeSession.updateCursorPosition()
            }
        })

        const s2 = activeEditor.onModeChanged.subscribe(() => {
            if (this.isSnippetActive) {
                this._activeSession.updateCursorPosition()
            }
        })

        const s3 = activeEditor.onBufferChanged.subscribe(() => {
            this._synchronizeSnippetObservable.next()
        })

        const s4 = snippetSession.onCancel.subscribe(() => {
            this.cancel()
        })

        this._disposables = [s1, s2, s3, s4]

        this._activeSession = snippetSession
    }

    public async nextPlaceholder(): Promise<void> {
        if (this.isSnippetActive) {
            return this._activeSession.nextPlaceholder()
        }
    }

    public async previousPlaceholder(): Promise<void> {
        if (this.isSnippetActive) {
            return this._activeSession.previousPlaceholder()
        }
    }

    public async cancel(): Promise<void> {
        if (this._activeSession) {
            this._cleanupAfterSession()
            await (this._editorManager.activeEditor as any).clearSelection()

            // TODO: Add 'stopInsert' and 'startInsert' methods on editor
            await this._editorManager.activeEditor.neovim.command("stopinsert")
        }

        if (this._currentLayer) {
            this._currentLayer.dispose()
        }
    }

    private _cleanupAfterSession(): void {
        Log.info("[SnippetManager::cancel]")
        this._disposables.forEach(d => d.dispose())
        this._disposables = []
        this._activeSession = null
    }
}
