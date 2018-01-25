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
    private _lifeTimeInMilliseconds: number = 2500 /* 2.5s */

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

    public setLifetime(lifeTimeInMilliseconds: number): void {
        this._lifeTimeInMilliseconds = lifeTimeInMilliseconds
    }

    public show(): void {
        this._store.dispatch({
            type: "SHOW_NOTIFICATION",
            id: this._id,
            title: this._title,
            detail: this._detail,
            level: this._level,
            lifeTime: this._lifeTimeInMilliseconds,
        })
    }

    public hide(): void {
        this._store.dispatch({
            type: "HIDE_NOTIFICATION",
            id: this._id,
        })
    }
}
