/**
 * WindowManager.ts
 *
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

import { Event, IEvent } from "./../Event"

import { applySplit, closeSplit, createSplitLeaf, createSplitRoot, ISplitInfo, ISplitLeaf, SplitDirection } from "./WindowSplit"

export class WindowManager {
    private _activeSplit: ISplitLeaf<Oni.Editor>
    private _splitRoot: ISplitInfo<Oni.Editor>

    private _onSplitChanged = new Event<ISplitInfo<Oni.Editor>>()

    public get onSplitChanged(): IEvent<ISplitInfo<Oni.Editor>> {
        return this._onSplitChanged
    }

    public get splitRoot(): ISplitInfo<Oni.Editor> {
        return this._splitRoot
    }

    constructor() {
        this._splitRoot = createSplitRoot(SplitDirection.Horizontal)
        this._activeSplit = null
    }

    public split(direction: SplitDirection, newEditor: Oni.Editor) {
        const newLeaf = createSplitLeaf(newEditor)
        this._splitRoot = applySplit(this._splitRoot, direction, newLeaf)

        this._onSplitChanged.dispatch(this._splitRoot)
    }

    public moveLeft(): void {
        // TODO
    }

    public moveRight(): void {
        // TODO
    }

    public moveUp(): void {
        // TODO
    }

    public moveDown(): void {
        // TODO
    }

    public showDock(direction: SplitDirection, newEditor: Oni.Editor) {
        // TODO
    }

    public close(editor: Oni.Editor) {
        this._splitRoot = closeSplit(this._splitRoot, editor)
        this._onSplitChanged.dispatch(this._splitRoot)
    }
}

export const windowManager = new WindowManager()
