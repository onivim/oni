/**
 * index.ts
 */

import { OverlayManager } from "./../Overlay"

import { Notifications } from "./Notifications"

export * from "./Notifications"

let _notifications: Notifications = null

export const activate = (overlayManager: OverlayManager): void => {
    _notifications = new Notifications(overlayManager)
}

export const getInstance = (): Notifications => {
    return _notifications
}
