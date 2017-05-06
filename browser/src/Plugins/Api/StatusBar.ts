/**
 * StatusBar.ts
 *
 * Implements API surface area for working with the status bar
 */

import { IPluginChannel } from "./Channel"

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
        private _id: number,
        private _alignment: StatusBarAlignment,
        private _priority: number,
    ) { }

    public show(): void {
        this._channel.send("statusbar-item-show", null, {
            id: this._id,
            alignment: this._alignment,
            // TODO: Does this need to be a string?
            latestElement: this._contents,
            priority: this._priority,
        })
    }

    public hide(): void {
        this._channel.send("statusbar-item-hide", null, {
            id: this._id,
        })
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

        return new StatusBarItem(this._channel, this._id, alignment, priority)
    }
}
