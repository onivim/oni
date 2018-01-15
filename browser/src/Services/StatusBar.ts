/**
 * StatusBar.ts
 *
 * Implements API surface area for working with the status bar
 */

import { Subject } from "rxjs/Subject"
import { Subscription } from "rxjs/Subscription"

import "rxjs/add/operator/auditTime"
import "rxjs/add/operator/debounceTime"

import * as Oni from "oni-api"
import { Configuration } from "./Configuration"

import * as Shell from "./../UI/Shell"

export enum StatusBarAlignment {
    Left,
    Right,
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
        Shell.Actions.showStatusBarItem(this._id, this._contents, this._alignment, this._priority)
    }

    public hide(): void {
        this._visible = false
        Shell.Actions.hideStatusBarItem(this._id)
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

    constructor(private _configuration: Configuration) {}

    public getItem(globalId: string): Oni.StatusBarItem {
        return new StatusBarItem(globalId)
    }

    public createItem(alignment: StatusBarAlignment, globalId?: string): Oni.StatusBarItem {
        this._id++
        const statusBarId = globalId || `${this._id}`
        const statusItems = this._configuration.getValue("statusbar.priority")
        const currentItem = statusItems[globalId]
        const itemPriority = currentItem || 0

        return new StatusBarItem(statusBarId, alignment, itemPriority)
    }
}

let _statusBar: StatusBar = null
export const activate = (configuration: Configuration): void => {
    _statusBar = new StatusBar(configuration)
}

export const getInstance = (): StatusBar => {
    return _statusBar
}
