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
    setContents(element: HTMLElement): void
}

export class StatusBarItem implements Oni.StatusBarItem {
    private _contents: HTMLElement

    constructor(
        private _channel: IPluginChannel,
        private _id: string,
        private _alignment: StatusBarAlignment,
        private _priority: number,
    ) { }

    public show(): void {
        this._channel.send("redux-action", null, ActionCreators.showStatusBarItem(this._id, this._contents.outerHTML, this._alignment, this._priority))
    }

    public hide(): void {
        this._channel.send("redux-action", null, ActionCreators.hideStatusBarItem(this._id))
    }

    public setContents(element: HTMLElement): void {
        this._contents = element
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

    public createItem(alignment: StatusBarAlignment, priority: number = 0): Oni.StatusBarItem {
        this._id++

        const statusBarId = `${this._channel.metadata}{this._id.toString()}`

        return new StatusBarItem(this._channel, statusBarId, alignment, priority)
    }
}
