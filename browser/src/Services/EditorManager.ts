/**
 * EditorManager.ts
 * 
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

import { Event, IEvent } from "./../Event"
import { IDisposable } from "./../IDisposable"

export class EditorManager implements Oni.EditorManager {
    private _activeEditor: ActiveEditor = new ActiveEditor()
    private _onActiveEditorChanged: Event<Oni.Editor> = new Event<Oni.Editor>()

    /**
     * API Methods
     */
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
        const oldEditor = this._activeEditor.getUnderlyingEditor()
        if (editor !== oldEditor) {
            this._onActiveEditorChanged.dispatch(editor)
            this._activeEditor.setActiveEditor(editor)
        }
    }
}

/**
 * ActiveEditor is a proxy for the Neovim interface,
 * exposing methods of the current editor.
 *
 * This manages tracking subscriptions as the active editor changes.
 */
export class ActiveEditor implements Oni.Editor {
    private _activeEditor: Oni.Editor
    private _onModeChanged: Event<string> = new Event<string>()
    private _subscriptions: IDisposable[] = []

    /**
     * API Methods
     */
    public get mode(): string {
        if (!this._activeEditor) {
            return null
        }

        return this._activeEditor.mode
    }

    public get onModeChanged(): IEvent<string> {
        return this._onModeChanged
    }

    /** 
     * Internal methods
     */

    public setActiveEditor(newEditor: Oni.Editor) {
        this._activeEditor = newEditor
        this._subscriptions.forEach((d) => d.dispose())
        this._subscriptions = []
        this._subscriptions.push(newEditor.onModeChanged.subscribe((val) => this._onModeChanged.dispatch(val)))
    }

    public getUnderlyingEditor(): Oni.Editor {
        return this._activeEditor
    }
}

export const editorManager: EditorManager = new EditorManager()
