/**
 * Notification.ts
 *
 * API interface for notification UX
 */

import { Store } from "redux"

import { INotificationsState, NotificationLevel } from "./NotificationStore"

export class Notification {
    private _title: string = ""
    private _detail: string = ""
    private _level: NotificationLevel = "info"

    constructor(
        private _id: string,
        private _store: Store<INotificationsState>,
    ) { }

    public setContents(title: string, detail: string): void {
        this._title = title
        this._detail = detail
    }

    public setLevel(level: NotificationLevel): void {
        this._level = level
    }

    public show(): void {
        this._store.dispatch({
            type: "SHOW_NOTIFICATION",
            id: this._id,
            title: this._title,
            detail: this._detail,
            level: this._level,
        })
    }

    public hide(): void {
        this._store.dispatch({
            type: "HIDE_NOTIFICATION",
            id: this._id,
        })
    }
}
