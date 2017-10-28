/**
 * StatusBar.ts
 *
 * Implements API surface area for working with the status bar
 */

import { Subject } from "rxjs/Subject"
import { Subscription } from "rxjs/Subscription"

import "rxjs/add/operator/auditTime"
import "rxjs/add/operator/debounceTime"

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

    private _setContentsSubject: Subject<any> = new Subject<any>()
    private _subscription: Subscription

    constructor(
        private _id: string,
        private _alignment?: StatusBarAlignment | null,
        private _priority?: number | null,
    ) {

        this._subscription = this._setContentsSubject
            .debounceTime(25)
            .subscribe((contents: any) => {
                if (this._visible) {
                    this.show()
                }
            })
    }

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
        this._setContentsSubject.next(element)
    }

    public dispose(): void {
        if (this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = null
            this._setContentsSubject = null
        }
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
