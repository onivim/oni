/**
 * WindowManager.ts
 *
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

import { remote } from "electron"

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

    public swapToPreviousSplit(): void {
        this._windowManager.hide(this._id)
    }
}

export class AugmentedWindow implements IAugmentedSplitInfo {
    public get id(): string {
        return this._id
    }

    constructor(private _id: string, private _innerSplit: Oni.IWindowSplit | any) {}

    public get innerSplit(): Oni.IWindowSplit {
        return this._innerSplit
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
}

export class WindowManager {
    private _lastId: number = 0
    private _idToSplit: { [key: string]: IAugmentedSplitInfo } = {}

    private _onUnhandledMoveEvent = new Event<Direction>()

    private _leftDock: WindowDockNavigator = null
    private _primarySplit: LinearSplitProvider
    private _rootNavigator: RelationalSplitNavigator

    // Queue of recently focused windows, to fall-back to
    // when closing a window.
    private _focusQueue: string[] = []

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

    get activeSplitHandle(): WindowSplitHandle {
        return new WindowSplitHandle(this._store, this, this.activeSplit.id)
    }

    private get activeSplit(): IAugmentedSplitInfo {
        const focusedSplit = this._store.getState().focusedSplitId

        if (!focusedSplit) {
            return null
        }

        return this._idToSplit[focusedSplit]
    }

    constructor() {
        this._rootNavigator = new RelationalSplitNavigator()

        const browserWindow = remote.getCurrentWindow()

        browserWindow.on("blur", () => {
            if (this.activeSplit) {
                this.activeSplit.leave()
            }
        })

        browserWindow.on("focus", () => {
            if (this.activeSplit) {
                this.activeSplit.enter()
            }
        })

        this._store = createStore()
        this._leftDock = new WindowDockNavigator(() => leftDockSelector(this._store.getState()))
        this._primarySplit = new LinearSplitProvider("horizontal")
        this._rootNavigator.setRelationship(this._leftDock, this._primarySplit, "right")
    }

    public createSplit(
        splitLocation: Direction | SplitDirection,
        newSplit: Oni.IWindowSplit,
        referenceSplit?: Oni.IWindowSplit,
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
                const augmentedRefSplit =
                    this._getAugmentedWindowSplitFromSplit(referenceSplit) || this.activeSplit
                this._primarySplit.split(augmentedWindow, splitLocation, augmentedRefSplit)
                const newState = this._primarySplit.getState() as ISplitInfo<Oni.IWindowSplit>

                this._store.dispatch({
                    type: "SET_PRIMARY_SPLITS",
                    splits: newState,
                })

                this._focusNewSplit(augmentedWindow)
        }

        return new WindowSplitHandle(this._store, this, windowId)
    }

    public getSplitHandle(split: Oni.IWindowSplit): WindowSplitHandle {
        const augmentedSplit = this._getAugmentedWindowSplitFromSplit(split)
        return new WindowSplitHandle(this._store, this, augmentedSplit.id)
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

    public close(splitId: string) {
        this.hide(splitId)
        delete this._idToSplit[splitId]
    }

    public hide(splitId: string) {
        const currentActiveSplit = this.activeSplit

        // Send focus back to most recently focused window
        if (currentActiveSplit.id === splitId) {
            const candidateSplits = this._focusQueue.filter(
                f => f !== splitId && this._idToSplit[f],
            )

            this._focusQueue = candidateSplits

            if (this._focusQueue.length > 0) {
                const splitToFocus = this._focusQueue[0]
                this._focusNewSplit(this._idToSplit[splitToFocus])
            }
        }

        const split = this._idToSplit[splitId]
        this._primarySplit.close(split)

        const state = this._primarySplit.getState()
        this._store.dispatch({
            type: "SET_PRIMARY_SPLITS",
            splits: state,
        })
    }

    public focusSplit(splitId: string): void {
        const split = this._idToSplit[splitId]
        this._focusNewSplit(split)
    }

    private _getAugmentedWindowSplitFromSplit(split: Oni.IWindowSplit): IAugmentedSplitInfo {
        const augmentedWindows = Object.values(this._idToSplit)
        return augmentedWindows.find(aw => aw.innerSplit === split) || null
    }

    private _focusNewSplit(newSplit: any): void {
        if (this.activeSplit && this.activeSplit.leave) {
            this.activeSplit.leave()
        }

        this._store.dispatch({
            type: "SET_FOCUSED_SPLIT",
            splitId: newSplit.id,
        })

        const filteredSplits = this._focusQueue.filter(f => f !== newSplit.id)
        this._focusQueue = [newSplit.id, ...filteredSplits]

        if (newSplit && newSplit.enter) {
            newSplit.enter()
        }
    }
}
