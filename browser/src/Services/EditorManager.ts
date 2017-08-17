/**
 * EditorManager.ts
 * 
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

export class EditorManager implements Oni.EditorManager {
    private _activeEditor: Oni.Editor = null

    public get activeEditor(): Oni.Editor {
        return this._activeEditor
    }

    public setActiveEditor(editor: Oni.Editor) {
        this._activeEditor = editor
    }
}

export const editorManager: EditorManager = new EditorManager()
