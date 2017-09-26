import { EventEmitter } from "events"

const KeyboardLayout = require("keyboard-layout")

import * as Log from "./../Log"

window["layout"] = KeyboardLayout.getCurrentKeyboardLayout()


const keystoignore = [
            "Shift",
            "Control",
            "Alt",
            "AltGraph",
            "CapsLock",
            "Pause",
            "ScrollLock",
            "AudioVolumeUp",
            "AudioVolumeDown"
]

const isShiftCharacter = (evt: KeyboardEvent): boolean => {

    const { key, code } = evt

    const mappedKey = KeyboardLayout.getCurrentKeymap()[code]

    if (!mappedKey) {
        return false
    }

    if (mappedKey.withShift === key || mappedKey.withAltGraphShift === key) {
        return true
    } else {
        return false
    }
}

const isAltGraphCharacter = (evt: KeyboardEvent): boolean => {
    const { key, code } = evt

    const mappedKey = KeyboardLayout.getCurrentKeymap()[code]

    if (!mappedKey) {
        return false
    }

    if (mappedKey.withAltGraph === key || mappedKey.withAltGraphShift === key) {
        return true
    } else {
        return false
    }
}

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

            if (keystoignore.indexOf(evt.key) >= 0) {
                return
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

        const isCharacterFromShiftKey = isShiftCharacter(evt)
        const isCharacterFromAltGraphKey = isAltGraphCharacter(evt)

        let mappedKey = vimKey

        if (mappedKey === "<") {
            mappedKey = "lt"
        }

        // On Windows, when the AltGr key is pressed, _both_
        // the evt.ctrlKey and evt.altKey are set to true.
        if (evt.ctrlKey && !isCharacterFromAltGraphKey) {
            mappedKey = "c-" + vimKey + ""
            evt.preventDefault()
        }

        if (evt.shiftKey && !isCharacterFromShiftKey) {
            mappedKey = "s-" + mappedKey
        }

        if (evt.altKey && !isCharacterFromAltGraphKey) {
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

        return mappedKey
    }

    private _convertKeyEventToVimKey(evt: KeyboardEvent): null | string {

        const keyCode: { [key: string]: string } = {
            "Backspace": "bs",
            "Escape": "esc",
            "Tab": "tab",     // Tab
            "ArrowLeft": "left",    // ArrowLeft
            "ArrowUp": "up",      // ArrowUp
            "ArrowRight": "right",   // ArrowRight
            "ArrowDown": "down",    // ArrowDown
            "Insert": "insert",
        }

        return keyCode[evt.key] ? keyCode[evt.key] : evt.key
    }
}
