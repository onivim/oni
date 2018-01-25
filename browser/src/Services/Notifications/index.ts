/**
 * index.ts
 */

import { Notifications } from "./Notifications"

let _notifications: Notifications = null

export const activate = (): void => {
    _notifications = new Notifications()
}

export const getInstance = (): Notifications => {
    return _notifications
}
