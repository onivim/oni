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

import { applySplit, closeSplit, createSplitLeaf, createSplitRoot, getFurthestSplitInDirection, ISplitInfo, /*ISplitLeaf,*/ Split, SplitDirection } from "./WindowSplit"

export enum DockPosition {
    // TODO: Other dock positions
    // Top,
    // Bottom,
    Left,
    // Right
}


export class WindowManager implements Oni.IWindowManager {
    private _activeSplit: any; // TODO: Port over new methods to oni-api
    private _splitRoot: ISplitInfo<Oni.IWindowSplit>

    private _onActiveSplitChanged = new Event<Oni.IWindowSplit>()
    private _onSplitChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()
    private _onDocksChanged = new Event<void>()

    private _docks: { [key: number]: Oni.IWindowSplit[] } = { }

    public get activeSplit(): any {
        return this._activeSplit
    }

    public get onActiveSplitChanged(): IEvent<Oni.IWindowSplit> {
        return this._onActiveSplitChanged
    }

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
            [DockPosition.Left]: [],
        }
    }

    public split(direction: SplitDirection, newSplit: Oni.IWindowSplit) {
        const newLeaf = createSplitLeaf(newSplit)
        this._splitRoot = applySplit(this._splitRoot, direction, newLeaf)


        this._focusNewSplit(newSplit)

        this._onSplitChanged.dispatch(this._splitRoot)
    }

    public getDocks(direction: DockPosition): Oni.IWindowSplit[] {
        return this._docks[direction]
    }

    private _focusNewSplit(newSplit: Oni.IWindowSplit): void {
        if (this._activeSplit && this._activeSplit.leave) {
            this._activeSplit.leave()
        }

        this._activeSplit = newSplit

        if (newSplit && newSplit.enter) {
            newSplit.enter()
        }

        this._onActiveSplitChanged.dispatch(this._activeSplit)
    }

    public moveLeft(): void {
        if (this._docks[DockPosition.Left].length) {
            this._focusNewSplit(this._docks[DockPosition.Left][0])
        }

    }

    public moveRight(): void {
        const activeSplit = this._activeSplit
        const leftDocks = this._docks[DockPosition.Left]

        if (leftDocks.indexOf(activeSplit) >= 0) {
            const newSplit = getFurthestSplitInDirection(this._splitRoot, Split.Left)

            if (newSplit) {
                this._focusNewSplit(newSplit.contents)
            }
        }
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
