"use strict";
const electron_1 = require("electron");
/**
 * Helper function to send request to main handler using ipc
 */
function send(type, payload) {
    electron_1.ipcRenderer.send("cross-browser-ipc", {
        type: type,
        meta: {
            senderId: -1,
            destinationId: 1 // TODO: What's the right value for this?
        },
        payload: payload
    });
}
exports.send = send;
//# sourceMappingURL=Sender.js.map