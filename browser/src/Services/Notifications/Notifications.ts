/**
 * Notifications.ts
 *
 * API interface and lifecycle manager for notifications UX
 */

import { Store } from "redux"

import { Overlay, OverlayManager } from "./../Overlay"

import { Notification } from "./Notification"
import { createStore, INotificationsState } from "./NotificationStore"

import { getView } from "./NotificationsView"

export class Notifications {

    private _id: number = 0
    private _overlay: Overlay
    private _store: Store<INotificationsState>

    constructor(
        private _overlayManager: OverlayManager
    ) {
        this._store = createStore()

        this._overlay = this._overlayManager.createItem()
        this._overlay.setContents(getView(this._store))
        this._overlay.show()
    }

    public createItem(): Notification {
        this._id++

        return new Notification("notification" + this._id.toString(), this._store)
    }
}
