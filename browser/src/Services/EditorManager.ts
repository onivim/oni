/**
 * EditorManager.ts
 *
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

import * as Oni from "oni-api"
import { Event, IDisposable, IEvent } from "oni-types"

import * as types from "vscode-languageserver-types"

import { remote } from "electron"

export class EditorManager implements Oni.EditorManager {
    private _allEditors: Oni.Editor[] = []
    private _activeEditor: Oni.Editor = null
    private _anyEditorProxy: AnyEditorProxy = new AnyEditorProxy()
    private _onActiveEditorChanged: Event<Oni.Editor> = new Event<Oni.Editor>()

    private _closeWhenNoEditors: boolean = true

    public get allEditors(): Oni.Editor[] {
        return this._allEditors
    }

    /**
     * API Methods
     */
    public get anyEditor(): Oni.Editor {
        return this._anyEditorProxy
    }

    public get activeEditor(): Oni.Editor {
        return this._activeEditor
    }

    public get onActiveEditorChanged(): IEvent<Oni.Editor> {
        return this._onActiveEditorChanged
    }

    public openFile(
        filePath: string,
        openOptions: Oni.FileOpenOptions = Oni.DefaultFileOpenOptions,
    ): Promise<Oni.Buffer> {
        return this._activeEditor.openFile(filePath, openOptions)
    }

    public setCloseWhenNoEditors(closeWhenNoEditors: boolean) {
        this._closeWhenNoEditors = closeWhenNoEditors
    }

    public registerEditor(editor: Oni.Editor) {
        if (this._allEditors.indexOf(editor) === -1) {
            this._allEditors.push(editor)
        }
    }

    public unregisterEditor(editor: Oni.Editor): void {
        this._allEditors = this._allEditors.filter(ed => ed !== editor)

        if (this._activeEditor === editor) {
            this.setActiveEditor(null)
        }

        if (this._allEditors.length === 0 && this._closeWhenNoEditors) {
            // Quit?
            remote.getCurrentWindow().close()
        }
    }

    /**
     * Internal Methods
     */
    public setActiveEditor(editor: Oni.Editor) {
        this._activeEditor = editor

        const oldEditor = this._anyEditorProxy.getUnderlyingEditor()
        if (editor !== oldEditor) {
            this._onActiveEditorChanged.dispatch(editor)
            this._anyEditorProxy.setActiveEditor(editor)
        }
    }
}

/**
 * AllEditors is a proxy for the Neovim interface,
 * exposing methods of 'all' editors, as an aggregate.
 *
 * This enables consumers to use `Oni.editor.allEditors.onModeChanged((newMode) => { ... }),
 * for convenience, as it handles manages tracking subscriptions as the active editor changes.
 */
class AnyEditorProxy implements Oni.Editor {
    private _activeEditor: Oni.Editor
    private _subscriptions: IDisposable[] = []

    private _onModeChanged = new Event<Oni.Vim.Mode>()
    private _onBufferEnter = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferLeave = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferChanged = new Event<Oni.EditorBufferChangedEventArgs>()
    private _onBufferSaved = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferScrolled = new Event<Oni.EditorBufferScrolledEventArgs>()
    private _onCursorMoved = new Event<Oni.Cursor>()

    /**
     * API Methods
     */
    public get mode(): string {
        if (!this._activeEditor) {
            return null
        }

        return this._activeEditor.mode
    }

    public get activeBuffer(): Oni.Buffer {
        // TODO: Replace with null-object pattern
        if (!this._activeEditor) {
            return null
        }

        return this._activeEditor.activeBuffer
    }

    public init(filesToOpen: string[], foldersToOpen: string[]): void {
        if (!this._activeEditor) {
            return
        }

        this._activeEditor.init(filesToOpen, foldersToOpen)
    }

    public get neovim(): Oni.NeovimEditorCapability {
        if (!this._activeEditor) {
            return null
        }

        return this._activeEditor.neovim
    }

    public get onModeChanged(): IEvent<Oni.Vim.Mode> {
        return this._onModeChanged
    }

    public get onBufferChanged(): IEvent<Oni.EditorBufferChangedEventArgs> {
        return this._onBufferChanged
    }

    public get onBufferEnter(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferEnter
    }

    public get onBufferLeave(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferLeave
    }

    public get onBufferSaved(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferSaved
    }

    public get onBufferScrolled(): IEvent<Oni.EditorBufferScrolledEventArgs> {
        return this._onBufferScrolled
    }

    public get onCursorMoved(): IEvent<Oni.Cursor> {
        return this._onCursorMoved
    }

    public dispose(): void {
        // tslint:disable-line
    }

    public async blockInput(
        inputFunction: (input: Oni.InputCallbackFunction) => Promise<void>,
    ): Promise<void> {
        return this._activeEditor.blockInput(inputFunction)
    }

    public async openFile(filePath: string, openOptions: Oni.FileOpenOptions): Promise<Oni.Buffer> {
        return this._activeEditor.openFile(filePath, openOptions)
    }

    public getBuffers(): Array<Oni.Buffer | Oni.InactiveBuffer> {
        return this._activeEditor.getBuffers()
    }

    public setTextOptions(options: Oni.EditorTextOptions): Promise<void> {
        return this._activeEditor.setTextOptions(options)
    }

    public render(): JSX.Element {
        if (!this._activeEditor) {
            return null
        }

        return this._activeEditor.render()
    }

    public setSelection(selectionRange: types.Range): Promise<void> {
        if (!this._activeEditor) {
            return null
        }

        return this._activeEditor.setSelection(selectionRange)
    }

    /**
     * Internal methods
     */

    public setActiveEditor(newEditor: Oni.Editor) {
        this._activeEditor = newEditor

        this._subscriptions.forEach(d => d.dispose())

        if (!newEditor) {
            return
        }

        this._subscriptions = [
            newEditor.onModeChanged.subscribe(val => this._onModeChanged.dispatch(val)),
            newEditor.onBufferEnter.subscribe(val => this._onBufferEnter.dispatch(val)),
            newEditor.onBufferLeave.subscribe(val => this._onBufferLeave.dispatch(val)),
            newEditor.onBufferChanged.subscribe(val => this._onBufferChanged.dispatch(val)),
            newEditor.onBufferSaved.subscribe(val => this._onBufferSaved.dispatch(val)),
            newEditor.onBufferScrolled.subscribe(val => this._onBufferScrolled.dispatch(val)),
            newEditor.onCursorMoved.subscribe(val => this._onCursorMoved.dispatch(val)),
        ]
    }

    public getUnderlyingEditor(): Oni.Editor {
        return this._activeEditor
    }
}

export const editorManager: EditorManager = new EditorManager()
