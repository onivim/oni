/**
 * WindowManager.ts
 *
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

import { Store } from "redux"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { Direction, SplitDirection } from "./index"
import { LinearSplitProvider } from "./LinearSplitProvider"
import { RelationalSplitNavigator } from "./RelationalSplitNavigator"
import { WindowDock } from "./WindowDock"

import { createStore, IAugmentedSplitInfo, ISplitInfo, WindowState } from "./WindowManagerStore"

export interface IWindowSplitHandle {
    id: string

    // Later:
    // show()
    // hide()
    // focus()
    // setSize()
}

export class AugmentedWindow implements IAugmentedSplitInfo {
    public get id(): string {
        return this._id
    }

    public render(): JSX.Element {
        return this._innerSplit.render()
    }

    public enter(): void {
        if (this._innerSplit.enter) {
            this._innerSplit.enter()
        }
    }

    public leave(): void {
        if (this._innerSplit.leave) {
            this._innerSplit.leave()
        }
    }

    constructor(private _id: string, private _innerSplit: Oni.IWindowSplit | any) {}
}

export class WindowManager {
    private _activeSplit: any

    private _lastId: number = 0

    private _onUnhandledMoveEvent = new Event<Direction>()

    private _leftDock: WindowDock = null
    private _primarySplit: LinearSplitProvider
    private _rootNavigator: RelationalSplitNavigator

    private _store: Store<WindowState>

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

    public get store(): Store<WindowState> {
        return this._store
    }

    constructor() {
        this._rootNavigator = new RelationalSplitNavigator()

        this._leftDock = new WindowDock()
        this._primarySplit = new LinearSplitProvider("horizontal")
        this._rootNavigator.setRelationship(this._leftDock, this._primarySplit, "right")

        this._store = createStore()
    }

    // public split(
    //     direction: SplitDirection,
    //     newSplit: Oni.IWindowSplit,
    //     referenceSplit?: Oni.IWindowSplit,
    // ) {

    //     this._primarySplit.split(augmentedWindow, direction, referenceSplit)
    //     const newState = this._primarySplit.getState() as ISplitInfo<Oni.IWindowSplit>

    //     this._store.dispatch({
    //         type: "SET_PRIMARY_SPLITS",
    //         splits: newState,
    //     })

    //     this._focusNewSplit(newSplit)
    // }

    public createSplit(
        splitLocation: Direction | SplitDirection,
        newSplit: Oni.IWindowSplit,
        referenceSplit?: any,
    ): IWindowSplitHandle {
        const nextId = this._lastId++
        const windowId = "oni.window." + nextId.toString()

        const augmentedWindow = new AugmentedWindow(windowId, newSplit)

        switch (splitLocation) {
            case "right":
            case "up":
            case "down":
            case "left": {
                this._store.dispatch({
                    type: "ADD_DOCK_SPLIT",
                    dock: splitLocation,
                    split: augmentedWindow,
                })
                break
            }
            case "horizontal":
            case "vertical":
                this._primarySplit.split(augmentedWindow, splitLocation, referenceSplit)
                const newState = this._primarySplit.getState() as ISplitInfo<Oni.IWindowSplit>

                this._store.dispatch({
                    type: "SET_PRIMARY_SPLITS",
                    splits: newState,
                })

                this._focusNewSplit(augmentedWindow)
        }

        return {
            id: windowId,
        }
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

    public close(split: any) {
        this._primarySplit.close(split)

        const state = this._primarySplit.getState()
        this._store.dispatch({
            type: "SET_PRIMARY_SPLITS",
            splits: state,
        })
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

        this._store.dispatch({
            type: "SET_FOCUSED_SPLIT",
            splitId: newSplit.id,
        })
        // this._onActiveSplitChangedEvent.dispatch(this._activeSplit)
    }
}
