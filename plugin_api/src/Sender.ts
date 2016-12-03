import { ipcRenderer } from "electron"

import { remote } from "electron"

const id = remote.getCurrentWebContents().id

/**
 * Helper function to send request to main handler using ipc
 */
export function send(type: string, originalEventContext: any, payload: any): void {
    ipcRenderer.send("cross-browser-ipc", {
        type: type,
        meta: {
            senderId: id,
            destinationId: global["SourceBrowserId"],
            originEvent: originalEventContext
        },
        payload: payload
    })
}

export function sendError(type: string, originalEventContext: any, error: string): void {
    ipcRenderer.send("cross-browser-ipc", {
        type: type,
        meta: {
            senderId: id,
            destinationId: global["SourceBrowserId"],
            originEvent: originalEventContext
        },
        error: error
    })
}

