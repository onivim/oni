import { EventEmitter } from "events"

import * as Log from "./../Log"

export class Keyboard extends EventEmitter {
    constructor() {
        super()

        document.body.addEventListener("keydown", (evt) => {
            /*
             * This prevents the opening and immediate
             * (unwanted) closing of external windows.
             * This problem seems to only exist in Mac OS.
             */
            if (evt.keyCode === 13) {
                evt.preventDefault()
            }

            const vimKey = this._convertKeyEventToVimKey(evt)
            const mappedKey = this._wrapWithBracketsAndModifiers(vimKey, evt)

            Log.debug(`[Key event] Code: ${evt.code} Key: ${evt.key} CtrlKey: ${evt.ctrlKey} ShiftKey: ${evt.shiftKey} AltKey: ${evt.altKey} | Resolution: ${mappedKey}`)

            if (mappedKey) {
                this.emit("keydown", mappedKey)
            }
        })
    }

    private _wrapWithBracketsAndModifiers(vimKey: null | string, evt: KeyboardEvent): null | string {
        if (vimKey === null) {
            return null
        }

        let mappedKey = vimKey

        if (mappedKey === "<") {
            mappedKey = "lt"
        }

        if (evt.ctrlKey) {
            mappedKey = "c-" + vimKey + ""
            evt.preventDefault()
        }

        if (evt.shiftKey) {
            mappedKey = "s-" + mappedKey
        }

        if (evt.altKey) {
            mappedKey = "a-" + mappedKey
            evt.preventDefault()
        }

        if (evt.metaKey) {
            mappedKey = "m-" + mappedKey
            evt.preventDefault()
        }

        if (mappedKey.length > 1) {
            mappedKey = "<" + mappedKey + ">"
        }

        return mappedKey.toLowerCase()
    }

    private _convertKeyEventToVimKey(evt: KeyboardEvent): null | string {

        const keyCode: { [key: string]: string } = {
            "Backspace": "bs",
            "Tab": "tab",     // Tab
            "ArrowLeft": "left",    // ArrowLeft
            "ArrowUp": "up",      // ArrowUp
            "ArrowRight": "right",   // ArrowRight
            "ArrowDown": "down",    // ArrowDown
            "Insert": "insert",
            "Shift": null,     // Shift left
            "Control": null,     // Ctrl left
            "Alt": null,     // Alt left
            "CapsLock": null,
            "Pause": null,
            "ScrollLock": null,     // Scroll lock
            "AudioVolumeUp": null,     // Volume up
            "AudioVolumeDown": null,     // Volume down
        }

        return keyCode[evt.key] ? keyCode[evt.key] : evt.key.toLowerCase()

    }
}
