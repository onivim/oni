/**
 * WindowManager.ts
 *
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { applySplit, closeSplit, createSplitLeaf, createSplitRoot, ISplitInfo, SplitDirection } from "./WindowSplit"

export class WindowManager implements Oni.IWindowManager {
    // private _activeSplit: ISplitLeaf<Oni.IWindowSplit>
    private _splitRoot: ISplitInfo<Oni.IWindowSplit>

    private _onSplitChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()

    public get onSplitChanged(): IEvent<ISplitInfo<Oni.IWindowSplit>> {
        return this._onSplitChanged
    }

    public get splitRoot(): ISplitInfo<Oni.IWindowSplit> {
        return this._splitRoot
    }

    constructor() {
        this._splitRoot = createSplitRoot(SplitDirection.Horizontal)
        // this._activeSplit = null
    }

    public split(direction: SplitDirection, newSplit: Oni.IWindowSplit) {
        const newLeaf = createSplitLeaf(newSplit)
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

    public showDock(direction: SplitDirection, split: Oni.IWindowSplit) {
        // TODO
    }

    public close(split: Oni.IWindowSplit) {
        this._splitRoot = closeSplit(this._splitRoot, split)
        this._onSplitChanged.dispatch(this._splitRoot)
    }
}

export const windowManager = new WindowManager()
