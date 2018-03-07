/**
 * MultiProcess.ts
 *
 * Utilities for managing interop between multiple open instances of ONI
 */

import { ipcRenderer } from "electron"

export class MultiProcess {
    public focusPreviousInstance(): void {
        ipcRenderer.send("focus-previous-instance")
    }

    public focusNextInstance(): void {
        ipcRenderer.send("focus-next-instance")
    }

    public moveToNextOniInstance(direction: string): void {
        ipcRenderer.send("move-to-next-oni-instance", direction)
    }
}

export const multiProcess = new MultiProcess()
