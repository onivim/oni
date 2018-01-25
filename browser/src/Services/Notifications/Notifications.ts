/**
 * Notifications.ts
 *
 * API interface and lifecycle manager for notifications UX
 */

import { Notification } from "./Notification"

export type NotificationLevel = "info" | "warn" | "error"

export class Notifications {

    private _id: number = 0

    public createItem(): Notification {
        this._id++

        return new Notification("notification" + this._id.toString())
    }
}
