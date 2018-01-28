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

import { Direction, SplitDirection } from "./index"
import { LinearSplitProvider } from "./LinearSplitProvider"
import { RelationalSplitNavigator } from "./RelationalSplitNavigator"
import { WindowDock } from "./WindowDock"
import { ISplitInfo } from "./WindowState"

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

    public focusSplit(split: Oni.IWindowSplit): void {
        this._focusNewSplit(split)
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
