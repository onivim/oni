/**
 * Persisted Settings
 *
 * Simple wrapper around 'electron-settings'
 */

import { remote } from "electron"

// We need to use the 'main process' version of electron-settings.
// See: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
const PersistentSettings = remote.require("electron-settings")

export const get = <T>(key: string): T => {
    return PersistentSettings.get(key) as T
}

export const set = <T>(key: string, val: T): void => {
    return PersistentSettings.set(key, val)
}
