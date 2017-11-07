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

export enum DockPosition {
    Top,
    Bottom,
    Left,
    Right
}

export class WindowManager {
    private _activeSplit: ISplitLeaf<Oni.IWindowSplit>
    private _splitRoot: ISplitInfo<Oni.IWindowSplit>

    private _onSplitChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()
    private _onDocksChanged = new Event<void>()

    private _docks: { [key: number]: Oni.IWindowSplit[] } = { }

    public get onSplitChanged(): IEvent<ISplitInfo<Oni.IWindowSplit>> {
        return this._onSplitChanged
    }

    public get onDocksChanged(): IEvent<void> {
        return this._onDocksChanged
    }

    public get splitRoot(): ISplitInfo<Oni.IWindowSplit> {
        return this._splitRoot
    }

    constructor() {
        this._splitRoot = createSplitRoot(SplitDirection.Horizontal)
        this._activeSplit = null

        this._docks = {
            [DockPosition.Top]: [],
            [DockPosition.Bottom]: [],
            [DockPosition.Left]: [],
            [DockPosition.Right]: [],
        }
    }

    public split(direction: SplitDirection, newSplit: Oni.IWindowSplit) {
        const newLeaf = createSplitLeaf(newSplit)
        this._splitRoot = applySplit(this._splitRoot, direction, newLeaf)

        this._onSplitChanged.dispatch(this._splitRoot)
    }

    public getDocks(direction: DockPosition): Oni.IWindowSplit[] {
        return this._docks[direction]
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

    public showDock(direction: DockPosition , split: Oni.IWindowSplit) {
        // Add the split to the set of docks
        this._docks = {
            ...this._docks,
            [direction]: [split, ...this._docks[direction]],
        }

        this._onDocksChanged.dispatch()
    }

    public removeDock(direction: DockPosition, split: Oni.IWindowSplit) {
        // TODO
    }

    public close(split: Oni.IWindowSplit) {
        this._splitRoot = closeSplit(this._splitRoot, split)
        this._onSplitChanged.dispatch(this._splitRoot)
    }
}

export const windowManager = new WindowManager()
