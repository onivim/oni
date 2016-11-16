import { ipcRenderer } from "electron"

/**
 * Helper function to send request to main handler using ipc
 */
export function send(type: string, payload: any): void {
    ipcRenderer.send("cross-browser-ipc", {
        type: type,
        meta: {
            senderId: -1,
            destinationId: 1 // TODO: What's the right value for this?
        },
        payload: payload
    })
}
