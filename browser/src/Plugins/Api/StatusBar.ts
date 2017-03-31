/**
 * StatusBar.ts
 *
 * - Implements API surface area for working with the status bar
 */


import { IPluginChannel } from "./Channel"

export enum StatusBarAlignment {
    Left,
    Right
}

export interface IStatusBarItem {
    show(): void
    hide(): void
    setContents(element: HTMLElement): void
}

export class StatusBarItem {
    private _contents: HTMLElement

    constructor(
        private _channel: IPluginChannel,
        private _id: number,
        private _alignment: StatusBarAlignment
    ) { }

    public show(): void {
        this._channel.send("statusbar-item-show", null, {
            id: this._id,
            alignment: this._alignment,
            latestElement: HTMLElement,
        })
    }

    public hide(): void {
        this._channel.send("statusbar-item-show", null, {
            id: this._id,
        })
    }

    public setContents(element: HTMLElement): void {
        this._contents = element
    }
}

export class StatusBar {
    // TODO: How to handle multiple items?
    private _id: number = 0

    constructor(
        private _channel: IPluginChannel
    ) { }

    public createItem(alignment: StatusBarAlignment): IStatusBarItem {
        this._id++

        return new StatusBarItem(this._channel, this._id, alignment)
    }
}
