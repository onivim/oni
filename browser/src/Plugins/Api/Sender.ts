import { EventEmitter } from "events"

/**
 * Interface that describes a strategy for sending data
 * to the main process from the plugin
 */
export interface ISender {
    send(type: string, originalEventContext: any, payload: any): void
    sendError(type: string, originalEventContext: any, error: string): void
}

export class EventSender extends EventEmitter {

    public send(type: string, originalEventContext: any, payload: any): void {
        this.emit("send", {
            type: type,
            meta: {
                originEvent: originalEventContext
            },
            payload: payload
        })
    }

    public sendError(type: string, originalEventContext: any, error: string): void {
        this.emit("send-error", {
            type: type,
            meta: {
                originEvent: originalEventContext
            },
            error: error
        })
    }
}

/**
 * Implementation of ISender leverage IPC
 */
// export class IpcSender {
//     private _id: number

//     constructor() {
//         this._id = remote.getCurrentWebContents().id
//     }

//     public send(type: string, originalEventContext: any, payload: any): void {
//         ipcRenderer.send("cross-browser-ipc", {
//             type: type,
//             meta: {
//                 senderId: this._id,
//                 destinationId: global["SourceBrowserId"],
//                 originEvent: originalEventContext
//             },
//             payload: payload
//         })
//     }

//     public sendError(type: string, originalEventContext: any, error: string): void {
//         ipcRenderer.send("cross-browser-ipc", {
//             type: type,
//             meta: {
//                 senderId: this._id,
//                 destinationId: global["SourceBrowserId"],
//                 originEvent: originalEventContext
//             },
//             error: error
//         })
//     }
// }
