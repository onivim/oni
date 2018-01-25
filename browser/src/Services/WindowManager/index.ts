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
// export enum Direction {
//     Right = 0,
//     Bottom = 1,
//     Left = 2,
//     Top = 3,
// }

export type Direction = "up" | "down" | "left" | "right"

export type SplitDirection = "horizontal" | "vertical"

export const getInverseDirection = (direction: Direction): Direction => {
    switch(direction) {
        case "up":
            return "down"
        case "down":
            return "up"
        case "left":
            return "left"
        case "right":
            return "right"
        default:
            return null
    }
}

// TODO: Add optional `enter` and `leave` methods to `oni-api`

import { applySplit, closeSplit, createSplitLeaf, createSplitRoot, getFurthestSplitInDirection, ISplitInfo, SplitDirection } from "./WindowSplit"

/**
 * Interface for something that can manage window splits:
 * - Navigating splits
 * - Creating a new split
 * - Removing a split
 * Later - resizing a split?
 */
export interface IWindowSplitProvider {
    contains(split: Oni.IWindowSplit): boolean

    move(startSplit: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit

    split(startSplit: Oni.IWindowSplit, direction: SplitDirection): boolean

    close(split: Oni.IWindowSplit): void
}

export interface WindowSplitRelationship {
    from: IWindowSplitProvider
    to: IWindowSplitProvider
    direction: string
}

export class SingleSplitProvider implements IWindowSplitProvider {
    constructor(
        private _split: Oni.IWindowSplit
    ) { }

    public contains(split: Oni.IWindowSplit): boolean {
        return this._split === split
    }

    public move(split: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {
        return null
    }

    public split(split: Oni.IWindowSplit, direction: Direction): boolean {
        return false
    }

    public close(split: Oni.IWindowSplit): void {
        this._split = null
    }
}

export class RelationalSplitProvider implements IWindowSplitProvider {

    private _relationships: WindowSplitRelationship[] = []
    private _providers: IWindowSplitProvider[] = []

    public setRelationship(from: IWindowSplitProvider, to: IWindowSplitProvider, direction: Direction): void {
        this._relationships.push({
            from,
            to,
            direction
        })

        // Also push the inverse
        this._relationships.push({
            from: to,
            to: from,
            direction: getInverseDirection(direction)
        })

        this._addToProvidersIfNeeded(from)
        this._addToProvidersIfNeeded(to)
    }

    public contains(split: Oni.IWindowSplit): boolean {
        return this._getContainingSplit(split) !== null
    }

    public close(split: Oni.IWindowSplit): void {
        const containingSplit = this._getContainingSplit(split)

        if (containingSplit) {
            containingSplit.close(split)
        }
    }

    public split(split: Oni.IWindowSplit, direction: SplitDirection): boolean {
        const containingSplit = this._getContainingSplit(split)

        if (containingSplit) {
            return containingSplit.split(split, direction)
        } else {
            return false
        }
    }

    public move(split: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {

        // If there is no current split, that means we are entering
        if (split === null) {
            // Need to find the furthest split in the *reverse* direction.
            // For example, if we are moving *right* into this split,
            // we want to grab the furthest *left* split
            const reverseDirection = getInverseDirection(direction)
            const splitProvider = this._getFurthestSplitInDirection(reverseDirection, null)
            return splitProvider.move(null, direction)
        }


        const containingSplit = this._getContainingSplit(split)

        if (!containingSplit) {
            return null
        }

        // Check if the containing split handled it
        const moveResult = containingSplit.move(split, direction)
        if (moveResult) {
            return moveResult
        }

        // The containing split couldn't handle it, so let's see if there is a relationship from the containing split
        const applicableRelationship = this._relationships.filter((rel) => rel.from === containingSplit && rel.direction === direction)

        if (applicableRelationship.length > 0) {
            return applicableRelationship[0].to.move(null, direction)
        } else {
            return null
        }
    }

    private _getFurthestSplitInDirection(direction: Direction, split: IWindowSplitProvider): IWindowSplitProvider {
        const splits = this._relationships.filter((rel) => rel.direction === direction && rel.from === split || split === null)

        // Base case - there are no further splits in that direction, so return the current one
        if (splits.length === 0) {
            return split
        }

        // Recursive case - take the 'to' split and see if there is anything further
        const currentRelationship = splits[0]
        return this._getFurthestSplitInDirection(direction, currentRelationship.to)
    }

    private _getContainingSplit(split: Oni.IWindowSplit): IWindowSplitProvider {
        const providers = this._providers.filter((s) => s.contains(split))
        return providers.length === 0 ? null : providers[0]
    }


    private _addToProvidersIfNeeded(provider: IWindowSplitProvider): void {
        if (this._providers.indexOf(provider) === -1) {
            this._providers.push(provider)
        }
    }
}

export interface IWindowDock extends IWindowSplitProvider {
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

    public move(startSplit: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {
        const currentIndex = this._splits.indexOf(startSplit)

        if (currentIndex === -1) {
            if (direction === Direction.Left) {
                return this._splits[this._splits.length - 1]
            } else if (direction === Direction.Right) {
                return this._splits[0]
            } else {
                return null
            }
        }

        // TODO: Generalize this - this is baked for a 'left dock' case right now
        const newIndex = direction === Direction.Left ? currentIndex - 1 : currentIndex + 1

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

    public close (split: Oni.IWindowSplit): void {
        this.removeSplit(split)
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

    private _onFocusChanged = new Event<ISplitInfo<Oni.IWindowSplit>>()

    public get onFocusChanged(): IEvent<ISplitInfo<Oni.IWindowSplit>> {
        return this._onFocusChanged
    }

    public get splitRoot(): ISplitInfo<Oni.IWindowSplit> {
        return this._splitRoot
    }

    public get activeSplit(): Oni.IWindowSplit {
        return this._activeSplit
    }

    public set activeSplit(split: Oni.IWindowSplit) {
        this._focusNewSplit(split)
    }

    constructor() {
        this._leftDock = new WindowDock()
        this._splitRoot = createSplitRoot(SplitDirection.Horizontal)
        // this._activeSplit = null
    }

    public split(direction: SplitDirection, newSplit: Oni.IWindowSplit) {
        const newLeaf = createSplitLeaf(newSplit)
        this._splitRoot = applySplit(this._splitRoot, direction, newLeaf)

        this._onSplitChanged.dispatch(this._splitRoot)

        this._focusNewSplit(newSplit)
    }

    public moveLeft(): void {
        const leftDock = this.getDock(Direction.Left)

        if (leftDock && leftDock.splits) {
            const newSplit = leftDock.move(this._activeSplit, Direction.Left)
            this._focusNewSplit(newSplit)
        }
    }

    public moveRight(): void {
        const leftDock = this.getDock(Direction.Left)

        if (leftDock.contains(this._activeSplit)) {
            const newSplit = leftDock.move(this._activeSplit, Direction.Right)

            // Navigation occurred within left dock
            if (newSplit) {
                this._focusNewSplit(newSplit)
            } else {
                const innerSplit = getFurthestSplitInDirection(this._splitRoot, 0 /* TODO - Reuse direction? */)

                if (innerSplit) {
                    this._focusNewSplit(innerSplit.contents)
                }
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
