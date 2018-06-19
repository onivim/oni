/**
 * index.ts
 */

import * as Log from "oni-core-logging"

import { OverlayManager } from "./../Overlay"

import { Configuration } from "./../Configuration"
import { Notifications } from "./Notifications"

export * from "./Notifications"

let _notifications: Notifications = null

export const activate = (configuration: Configuration, overlayManager: OverlayManager): void => {
    _notifications = new Notifications(overlayManager)

    const updateFromConfiguration = () => {
        const areNotificationsEnabled = configuration.getValue("notifications.enabled")
        Log.info("[Notifications] Setting enabled: " + areNotificationsEnabled)
        areNotificationsEnabled ? _notifications.enable() : _notifications.disable()
    }

    configuration.onConfigurationChanged.subscribe(val => {
        if (typeof val["notifications.enabled"] === "boolean") {
            updateFromConfiguration()
        }
    })

    updateFromConfiguration()
}

export const getInstance = (): Notifications => {
    return _notifications
}
