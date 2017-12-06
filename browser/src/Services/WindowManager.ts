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

import { applySplit, closeSplit, createSplitLeaf, createSplitRoot, getFurthestSplitInDirection, ISplitInfo, SplitDirection } from "./WindowSplit"

export interface IWindowDock {
    splits: Oni.IWindowSplit[]

    onSplitsChanged: IEvent<void>

    addSplit(split: Oni.IWindowSplit): void
    removeSplit(split: Oni.IWindowSplit): void
}

export class WindowDock implements IWindowDock {

    private _splits: Oni.IWindowSplit[] = []
    private _onSplitsChangedEvent: Event<void> = new Event<void>()

    public get splits(): Oni.IWindowSplit[] {
        return this._splits
    }

    public get onSplitsChanged(): IEvent<void> {
        return this._onSplitsChangedEvent
    }

    public addSplit(split: Oni.IWindowSplit): void {
        this._splits.push(split)
        this._onSplitsChangedEvent.dispatch()
    }

    public removeSplit(split: Oni.IWindowSplit): void {
        this._splits = this._splits.filter((s) => s !== split)
        this._onSplitsChangedEvent.dispatch()
    }
}

export class WindowManager implements Oni.IWindowManager {
    private _activeSplit: any
    private _splitRoot: ISplitInfo<Oni.IWindowSplit>

    private _onActiveSplitChangedEvent = new Event<Oni.IWindowSplit>()
    private _onSplitChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()

    private _leftDock: IWindowDock = null

    public get onActiveSplitChanged(): IEvent<Oni.IWindowSplit> {
        return this._onActiveSplitChangedEvent
    }

    public get onSplitChanged(): IEvent<ISplitInfo<Oni.IWindowSplit>> {
        return this._onSplitChanged
    }

    public get splitRoot(): ISplitInfo<Oni.IWindowSplit> {
        return this._splitRoot
    }

    public get activeSplit(): Oni.IWindowSplit {
        return this._activeSplit
    }

    constructor() {
        this._leftDock = new WindowDock()
        this._splitRoot = createSplitRoot(SplitDirection.Horizontal)
        // this._activeSplit = null
    }

    public split(direction: SplitDirection, newSplit: Oni.IWindowSplit) {
        const newLeaf = createSplitLeaf(newSplit)
        this._splitRoot = applySplit(this._splitRoot, direction, newLeaf)

        this._focusNewSplit(newSplit)

        this._onSplitChanged.dispatch(this._splitRoot)
    }

    public moveLeft(): void {
        const leftDock = this.getDock(Direction.Left)

        if (leftDock && leftDock.splits) {
            const splitCount = leftDock.splits.length
            this._focusNewSplit(leftDock.splits[splitCount - 1])
        }
    }

    public moveRight(): void {
        const leftDock = this.getDock(Direction.Left)

        if (leftDock.splits.indexOf(this._activeSplit) >= 0) {
            const newSplit = getFurthestSplitInDirection(this._splitRoot, 0 /* TODO - Reuse direction? */)

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

    private _focusNewSplit(newSplit: any): void {
        if (this._activeSplit && this._activeSplit.leave) {
            this._activeSplit.leave()
        }

        this._activeSplit = newSplit

        if (newSplit && newSplit.enter) {
            newSplit.enter()
        }

        this._onActiveSplitChangedEvent.dispatch(this._activeSplit)
    }
}

export const windowManager = new WindowManager()
