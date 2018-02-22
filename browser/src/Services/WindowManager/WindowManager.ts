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
import { WindowDockNavigator } from "./WindowDock"

import {
    createStore,
    IAugmentedSplitInfo,
    ISplitInfo,
    leftDockSelector,
    WindowState,
} from "./WindowManagerStore"

export class WindowSplitHandle implements Oni.WindowSplitHandle {
    public get id(): string {
        return this._id
    }

    public get isVisible(): boolean {
        return this._store.getState().hiddenSplits.indexOf(this._id) === -1
    }

    public get isFocused(): boolean {
        return this._store.getState().focusedSplitId === this._id
    }

    constructor(
        private _store: Store<WindowState>,
        private _windowManager: WindowManager,
        private _id: string,
    ) {}

    public hide(): void {
        this._store.dispatch({
            type: "HIDE_SPLIT",
            splitId: this._id,
        })
    }

    public show(): void {
        this._store.dispatch({
            type: "SHOW_SPLIT",
            splitId: this._id,
        })
    }

    public focus(): void {
        // TODO:
        this._windowManager.focusSplit(this._id)
    }

    public setSize(size: number): void {
        // TODO
    }

    public close(): void {
        this._windowManager.close(this._id)
    }
}

export class AugmentedWindow implements IAugmentedSplitInfo {
    public get id(): string {
        return this._id
    }

    constructor(private _id: string, private _innerSplit: Oni.IWindowSplit | any) {}

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
}

const invertDirection = (direction: SplitDirection): SplitDirection => {
    switch (direction) {
        case "horizontal":
            return "vertical"
        case "vertical":
            return "horizontal"
        default:
            return null
    }
}

export class WindowManager {
    private _lastId: number = 0
    private _idToSplit: { [key: string]: IAugmentedSplitInfo } = {}

    private _onUnhandledMoveEvent = new Event<Direction>()

    private _leftDock: WindowDockNavigator = null
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

    public get store(): Store<WindowState> {
        return this._store
    }

    public get activeSplit(): IAugmentedSplitInfo {
        const focusedSplit = this._store.getState().focusedSplitId

        if (!focusedSplit) {
            return null
        }

        return this._idToSplit[focusedSplit]
    }

    constructor() {
        this._rootNavigator = new RelationalSplitNavigator()

        this._store = createStore()
        this._leftDock = new WindowDockNavigator(() => leftDockSelector(this._store.getState()))
        this._primarySplit = new LinearSplitProvider("horizontal")
        this._rootNavigator.setRelationship(this._leftDock, this._primarySplit, "right")
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
    ): WindowSplitHandle {
        const nextId = this._lastId++
        const windowId = "oni.window." + nextId.toString()

        const augmentedWindow = new AugmentedWindow(windowId, newSplit)

        this._idToSplit[windowId] = augmentedWindow

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

        return new WindowSplitHandle(this._store, this, windowId)
    }

    public move(direction: Direction): void {
        const focusedSplit = this._store.getState().focusedSplitId

        if (!focusedSplit) {
            return
        }

        const activeSplit = this._idToSplit[focusedSplit]

        if (!activeSplit) {
            return
        }

        const newSplit = this._rootNavigator.move(activeSplit, direction)

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

    public close(splitId: any) {
        const split = this._idToSplit[splitId]
        this._primarySplit.close(split)

        const state = this._primarySplit.getState()
        this._store.dispatch({
            type: "SET_PRIMARY_SPLITS",
            splits: state,
        })

        this._idToSplit[splitId] = null
    }

    public focusSplit(splitId: string): void {
        const split = this._idToSplit[splitId]
        this._focusNewSplit(split)
    }

    private _focusNewSplit(newSplit: any): void {
        if (this.activeSplit && this.activeSplit.leave) {
            this.activeSplit.leave()
        }

        this._store.dispatch({
            type: "SET_FOCUSED_SPLIT",
            splitId: newSplit.id,
        })

        if (newSplit && newSplit.enter) {
            newSplit.enter()
        }
    }
}
