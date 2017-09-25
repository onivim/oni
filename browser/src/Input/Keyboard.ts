import { EventEmitter } from "events"

import * as Log from "./../Log"

// List taken from:
// https://github.com/zeit/hyper/blob/7a08b1dc3e07ae552debfe7e62c48b0a5a028ff9/lib/utils/key-code.js
const suppressShiftKeyCharacters = [
  "~",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "+",
  "{",
  "}",
  "|",
  ":",
  "'",
  "\"",
  "<",
  ">",
  "?",
]

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

        if (evt.shiftKey && suppressShiftKeyCharacters.indexOf(mappedKey) === -1) {
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

        const keyCode: { [key: number]: string } = {
            8: "bs",      // Backspace
            9: "tab",     // Tab
            13: "enter",   // Enter
            27: "esc",     // Escape
            33: "pageup",  // Page up
            34: "pagedown", // Page down
            35: "end",
            36: "home",
            37: "left",    // ArrowLeft
            38: "up",      // ArrowUp
            39: "right",   // ArrowRight
            40: "down",    // ArrowDown
            45: "insert",
            114: "f3",
            116: "f5",
            123: "f12",
            16: null,     // Shift left
            17: null,     // Ctrl left
            18: null,     // Alt left
            19: null,     // Pause
            20: null,     // Caps lock
            145: null,     // Scroll lock
            174: null,     // Volume up
            175: null,     // Volume down
        }

        return keyCode[evt.keyCode] ? keyCode[evt.keyCode] : evt.key

    }
}
