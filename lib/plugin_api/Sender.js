"use strict";
const electron_1 = require("electron");
const electron_2 = require("electron");
const id = electron_2.remote.getCurrentWebContents().id;
/**
 * Helper function to send request to main handler using ipc
 */
function send(type, payload) {
    electron_1.ipcRenderer.send("cross-browser-ipc", {
        type: type,
        meta: {
            senderId: id,
            destinationId: 1 // TODO: What's the right value for this?
        },
        payload: payload
    });
}
exports.send = send;
//# sourceMappingURL=Sender.js.map