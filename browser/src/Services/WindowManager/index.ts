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

export * from "./LinearSplitProvider"
export * from "./RelationalSplitProvider"
export * from "./WindowSplit"

// TODO: Possible API types?
export type Direction = "up" | "down" | "left" | "right"
export type SplitDirection = "horizontal" | "vertical"

export const getInverseDirection = (direction: Direction): Direction => {
    switch (direction) {
        case "up":
            return "down"
        case "down":
            return "up"
        case "left":
            return "right"
        case "right":
            return "left"
        default:
            return null
    }
}

import { ISplitInfo, SplitOrLeaf } from "./WindowSplit"

import { LinearSplitProvider } from "./LinearSplitProvider"
import { RelationalSplitNavigator } from "./RelationalSplitProvider"

/**
 * Interface for something that can navigate between window splits
 */
export interface IWindowSplitNavigator {
    contains(split: Oni.IWindowSplit): boolean
    move(startSplit: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit
}

/**
 * Interface for something that can manage window splits:
 * - Navigating splits
 * - Creating a new split
 * - Removing a split
 * Later - resizing a split?
 */
export interface IWindowSplitProvider extends IWindowSplitNavigator {
    split(
        newSplit: Oni.IWindowSplit,
        direction: SplitDirection,
        referenceSplit?: Oni.IWindowSplit,
    ): boolean
    close(split: Oni.IWindowSplit): boolean
    getState(): SplitOrLeaf<Oni.IWindowSplit>
}

export class SingleSplitProvider implements IWindowSplitProvider {
    constructor(private _split: Oni.IWindowSplit) {}

    public contains(split: Oni.IWindowSplit): boolean {
        return this._split === split
    }

    public move(split: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {
        if (split === null) {
            return this._split
        } else {
            return null
        }
    }

    public split(split: Oni.IWindowSplit, direction: SplitDirection): boolean {
        return false
    }

    public close(split: Oni.IWindowSplit): boolean {
        return false
    }

    public getState(): SplitOrLeaf<Oni.IWindowSplit> {
        return {
            type: "Leaf",
            contents: this._split,
        }
    }
}

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

    public contains(split: Oni.IWindowSplit): boolean {
        return this._splits.indexOf(split) >= 0
    }

    public split(startSplit: Oni.IWindowSplit, splitDirection: SplitDirection): boolean {
        this.addSplit(startSplit)
        return true
    }

    public move(startSplit: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {
        const currentIndex = this._splits.indexOf(startSplit)

        if (currentIndex === -1) {
            if (direction === "left") {
                return this._splits[this._splits.length - 1]
            } else if (direction === "right") {
                return this._splits[0]
            } else {
                return null
            }
        }

        // TODO: Generalize this - this is baked for a 'left dock' case right now
        const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1

        if (newIndex >= 0 && newIndex < this._splits.length) {
            return this._splits[newIndex]
        } else {
            return null
        }
    }

    public addSplit(split: Oni.IWindowSplit): void {
        this._splits = [...this._splits, split]
        this._onSplitsChangedEvent.dispatch()
    }

    public close(split: Oni.IWindowSplit): boolean {
        this.removeSplit(split)
        return true
    }

    public removeSplit(split: Oni.IWindowSplit): void {
        this._splits = this._splits.filter(s => s !== split)
        this._onSplitsChangedEvent.dispatch()
    }
}

export class WindowManager {
    private _activeSplit: any

    private _onActiveSplitChangedEvent = new Event<Oni.IWindowSplit>()
    private _onSplitChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()
    private _onUnhandledMoveEvent = new Event<Direction>()

    private _leftDock: WindowDock = null
    private _primarySplit: LinearSplitProvider
    private _rootNavigator: RelationalSplitNavigator

    public get onActiveSplitChanged(): IEvent<Oni.IWindowSplit> {
        return this._onActiveSplitChangedEvent
    }

    public get onSplitChanged(): IEvent<ISplitInfo<Oni.IWindowSplit>> {
        return this._onSplitChanged
    }

    public get onUnhandledMove(): IEvent<Direction> {
        return this._onUnhandledMoveEvent
    }

    private _onFocusChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()

    public get onFocusChanged(): IEvent<ISplitInfo<Oni.IWindowSplit>> {
        return this._onFocusChanged
    }

    public get splitRoot(): ISplitInfo<Oni.IWindowSplit> {
        return this._primarySplit.getState() as ISplitInfo<Oni.IWindowSplit>
    }

    public get activeSplit(): Oni.IWindowSplit {
        return this._activeSplit
    }

    public set activeSplit(split: Oni.IWindowSplit) {
        this._focusNewSplit(split)
    }

    constructor() {
        this._rootNavigator = new RelationalSplitNavigator()

        this._leftDock = new WindowDock()
        this._primarySplit = new LinearSplitProvider("horizontal")

        this._rootNavigator.setRelationship(this._leftDock, this._primarySplit, "right")
    }

    public split(
        direction: SplitDirection,
        newSplit: Oni.IWindowSplit,
        referenceSplit?: Oni.IWindowSplit,
    ) {
        this._primarySplit.split(newSplit, direction, referenceSplit)
        const newState = this._primarySplit.getState() as ISplitInfo<Oni.IWindowSplit>

        this._onSplitChanged.dispatch(newState)
        this._focusNewSplit(newSplit)
    }

    public move(direction: Direction): void {
        const newSplit = this._rootNavigator.move(this._activeSplit, direction)

        if (newSplit) {
            this._focusNewSplit(newSplit)
        } else {
            this._onUnhandledMoveEvent.dispatch(direction)
        }
    }

    public moveLeft(): void {
        this.move("left")
    }

    public moveRight(): void {
        this.move("right")
    }

    public moveUp(): void {
        this.move("up")
    }

    public moveDown(): void {
        this.move("down")
    }

    public getDock(direction: Direction): WindowDock {
        if (direction === "left") {
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
        this._primarySplit.close(split)
        this._onSplitChanged.dispatch(this.splitRoot)
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
