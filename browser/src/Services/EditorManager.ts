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

import * as Log from "./../Log"

export class EditorManager implements Oni.EditorManager {
    private _activeEditor: Oni.Editor = null
    private _allEditors: AllEditors = new AllEditors()
    private _onActiveEditorChanged: Event<Oni.Editor> = new Event<Oni.Editor>()

    /**
     * API Methods
     */
    public get allEditors(): Oni.Editor {
        return this._allEditors
    }

    public get activeEditor(): Oni.Editor {
        return this._activeEditor
    }

    public get onActiveEditorChanged(): IEvent<Oni.Editor> {
        return this._onActiveEditorChanged
    }

    /**
     * Internal Methods
     */
    public setActiveEditor(editor: Oni.Editor) {
        this._activeEditor = editor

        const oldEditor = this._allEditors.getUnderlyingEditor()
        if (editor !== oldEditor) {
            this._onActiveEditorChanged.dispatch(editor)
            this._allEditors.setActiveEditor(editor)
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
class AllEditors implements Oni.Editor {
    private _activeEditor: Oni.Editor
    private _subscriptions: IDisposable[] = []

    private _onModeChanged = new Event<Oni.Vim.Mode>()
    private _onBufferEnter = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferLeave = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferChanged = new Event<Oni.EditorBufferChangedEventArgs>()
    private _onBufferSaved = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferScrolled = new Event<Oni.EditorBufferScrolledEventArgs>()

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

    public get neovim(): Oni.NeovimEditorCapability {
        if (!this._activeEditor) {
            return null
        }

        return this._activeEditor.neovim
    }

    public async openFile(file: string, method = "edit"): Promise<Oni.Buffer> {
        let cmd = ":"
        switch (method) {
            case "tab":
                cmd += "taball"
                break
            case "horizontal":
                cmd += "sp"
                break
            case "vertical":
                cmd += "vsp"
                break
            case "edit":
            default:
                cmd += "e!"
                break
        }
        await this._activeEditor.neovim.command(`${cmd} ${file}`)
        return this._activeEditor.activeBuffer
    }

    public openFiles(files: string[]): Promise<Oni.Buffer[]> {
        Log.warn("Not implemented")
        return Promise.resolve([])
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

    public dispose(): void {
        // tslint:disable-line
    }

    /**
     * Internal methods
     */

    public setActiveEditor(newEditor: Oni.Editor) {
        this._activeEditor = newEditor
        this._subscriptions.forEach((d) => d.dispose())
        this._subscriptions = []
        this._subscriptions.push(newEditor.onModeChanged.subscribe((val) => this._onModeChanged.dispatch(val)))
        this._subscriptions.push(newEditor.onBufferEnter.subscribe((val) => this._onBufferEnter.dispatch(val)))
        this._subscriptions.push(newEditor.onBufferLeave.subscribe((val) => this._onBufferLeave.dispatch(val)))
        this._subscriptions.push(newEditor.onBufferChanged.subscribe((val) => this._onBufferChanged.dispatch(val)))
        this._subscriptions.push(newEditor.onBufferSaved.subscribe((val) => this._onBufferSaved.dispatch(val)))
        this._subscriptions.push(newEditor.onBufferScrolled.subscribe((val) => this._onBufferScrolled.dispatch(val)))
    }

    public getUnderlyingEditor(): Oni.Editor {
        return this._activeEditor
    }
}

export const editorManager: EditorManager = new EditorManager()
