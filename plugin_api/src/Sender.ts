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
            destinationId: 1, // TODO: What's the right value for this? Will be needed for multiple browser window case
            originEvent: originalEventContext
        },
        payload: payload
    })
}
