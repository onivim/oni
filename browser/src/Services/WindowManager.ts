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

// TODO: Add 'direction' enum to `oni-types'
export enum Direction {
    Right = 0,
    Bottom = 1,
    Left = 2,
    Top = 3,
}

// TODO: Add optional `enter` and `leave` methods to `oni-api`

import { applySplit, closeSplit, createSplitLeaf, createSplitRoot, ISplitInfo, SplitDirection } from "./WindowSplit"

export interface IWindowDock {
    splits: Oni.IWindowSplit[]

    onSplitsChanged(): IEvent<void>

    addSplit(split: Oni.IWindowSplit): void 
    removeSplit(split: Oni.IWindowSplit): void
}

export class WindowManager implements Oni.IWindowManager {
    // private _activeSplit: ISplitLeaf<Oni.IWindowSplit>
    private _splitRoot: ISplitInfo<Oni.IWindowSplit>

    private _onSplitChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()

    private _leftDock: IWindowDock = null

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

    public getDock(direction: Direction): IWindowDock {
        if (direction === Direction.Left) {
            return this._leftDock
        } else {
            // TODO
            return null
        }
    }

    // TODO: Deprecate
    public showDock(direction: SplitDirection, split: Oni.IWindowSplit) {
        // TODO
    }

    public close(split: Oni.IWindowSplit) {
        this._splitRoot = closeSplit(this._splitRoot, split)
        this._onSplitChanged.dispatch(this._splitRoot)
    }
}

export const windowManager = new WindowManager()
