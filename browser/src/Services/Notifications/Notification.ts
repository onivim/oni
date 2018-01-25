/**
 * Notification.ts
 *
 * API interface for notification UX
 */

import { NotificationLevel } from "./Notifications"

export class Notification {
    private _title: string = ""
    private _detail: string = ""
    private _level: NotificationLevel = "info"
    private _lifeTimeInMilliseconds: number = 2500 /* 2.5s */

    constructor(
        private _id: string,
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
        console.log(this._id + this._title + this._detail + this._level + this._lifeTimeInMilliseconds)
    }
}
