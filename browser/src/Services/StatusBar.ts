/**
 * StatusBar.ts
 *
 * Implements API surface area for working with the status bar
 */

import * as UI from "./../UI"

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
        private _id: string,
        private _alignment?: StatusBarAlignment | null,
        private _priority?: number | null,
    ) { }

    public show(): void {
        this._visible = true
        UI.Actions.showStatusBarItem(this._id, this._contents, this._alignment, this._priority)
    }

    public hide(): void {
        this._visible = false
        UI.Actions.hideStatusBarItem(this._id)
    }

    public setContents(element: any): void {
        this._contents = element

        if (this._visible) {
            this.show()
        }
    }

    public dispose(): void {
        throw new Error("Not implemented")
    }
}

class StatusBar implements Oni.StatusBar {
    private _id: number = 0

    public getItem(globalId: string): Oni.StatusBarItem {
        return new StatusBarItem(globalId)
    }

    public createItem(alignment: StatusBarAlignment, priority: number = 0, globalId?: string): Oni.StatusBarItem {
        this._id++

        const statusBarId = globalId || `${this._id.toString()}`

        return new StatusBarItem(statusBarId, alignment, priority)
    }
}

export const statusBar = new StatusBar()
