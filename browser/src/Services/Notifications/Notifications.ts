/**
 * Notifications.ts
 *
 * API interface and lifecycle manager for notifications UX
 */

import { Store } from "redux"

import { Notification } from "./Notification"
import { createStore, INotificationsState } from "./NotificationStore"

export class Notifications {

    private _id: number = 0
    private _store: Store<INotificationsState>

    constructor() {
        this._store = createStore()
    }

    public createItem(): Notification {
        this._id++

        return new Notification("notification" + this._id.toString(), this._store)
    }
}
