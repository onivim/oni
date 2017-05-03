/**
 * MultiProcess.ts
 *
 * Utilities for managing interop between multiple open instances of ONI
 */

import { ipcRenderer } from "electron"

export const focusPreviousInstance = (): void => {
    ipcRenderer.send("focus-previous-instance")
}

export const focusNextInstance = (): void => {
    ipcRenderer.send("focus-next-instance")
}
