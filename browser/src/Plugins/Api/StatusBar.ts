/**
 * StatusBar.ts
 *
 * Implements API surface area for working with the status bar
 */

import { IPluginChannel } from "./Channel"

import * as ActionCreators from "./../../UI/ActionCreators"

export enum StatusBarAlignment {
    Left,
    Right,
}

export interface IStatusBarItem {
    show(): void
    hide(): void
    setContents(element: any): void
}

export class StatusBarItem implements Oni.StatusBarItem {
    private _contents: JSX.Element
    private _visible: boolean = false

    constructor(
        private _channel: IPluginChannel,
        private _id: string,
        private _alignment?: StatusBarAlignment | null,
        private _priority?: number | null,
    ) { }

    public show(): void {
        this._visible = true
        this._channel.send("redux-action", null, ActionCreators.showStatusBarItem(this._id, this._contents, this._alignment, this._priority))
    }

    public hide(): void {
        this._visible = false
        this._channel.send("redux-action", null, ActionCreators.hideStatusBarItem(this._id))
    }

    public setContents(element: any): void {
        this._contents = element

        if (this._visible) {
            this.show()
        }
    }

    public dispose(): void {
        throw "Not implemented"
    }
}

export class StatusBar implements Oni.StatusBar {
    private _id: number = 0

    constructor(
        private _channel: IPluginChannel,
    ) { }

    public getItem(globalId: string): Oni.StatusBarItem {
        return new StatusBarItem(this._channel, globalId)
    }

    public createItem(alignment: StatusBarAlignment, priority: number = 0, globalId?: string): Oni.StatusBarItem {
        this._id++

        const statusBarId = globalId || `${this._channel.metadata.name}${this._id.toString()}`

        return new StatusBarItem(this._channel, statusBarId, alignment, priority)
    }
}
