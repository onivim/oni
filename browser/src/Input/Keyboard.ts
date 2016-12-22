import { EventEmitter } from "events"

export class Keyboard extends EventEmitter {
    constructor() {
        super()

        document.addEventListener("keydown", (evt) => {
            console.log("Keydown: " + evt) // tslint:disable-line no-console

            const vimKey = this._convertKeyEventToVimKey(evt)
            const mappedKey = this._wrapWithBracketsAndModifiers(vimKey, evt)

            if (mappedKey) {
                this.emit("keydown", mappedKey)
            }

            // Temporary workaround to block closing Window
            // The default electron menu maps C-w to close the window,
            // so we need to stop that.
            //
            // Later, the menu should be customized to fix this.
            if (mappedKey === "<C-w>" || mappedKey === "<C-r>") {
                evt.preventDefault()
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
            mappedKey = "C-" + vimKey + ""
        }

        if (evt.altKey) {
            mappedKey = "A-" + mappedKey
        }

        if (mappedKey.length > 1) {
            mappedKey = "<" + mappedKey + ">"
        }

        return mappedKey
    }

    private _convertKeyEventToVimKey(evt: KeyboardEvent): null | string {
        switch (evt.keyCode) {
            case 8: // Backspace
                return "bs"
            case 9: // Tab
                return "tab"
            case 13: // Enter
                return "enter"
            case 27: // Escape
                return "esc"
            case 33: // Page up
                return "pageup"
            case 34: // Page down
                return "pagedown"
            case 35:
                return "end"
            case 36:
                return "home"
            case 37: // ArrowLeft
                return "left"
            case 38: // ArrowUp
                return "up"
            case 39: // ArrowRight
                return "right"
            case 40: // ArrowDown
                return "down"
            case 45:
                return "insert"
            case 114:
                return "f3"
            case 116:
                return "f5"
            case 123:
                return "f12"
            case 16: // Shift left
            case 17: // Ctrl left
            case 18: // Alt left
            case 19: // Pause
            case 20: // Caps lock
            case 145: // Scroll lock
            case 174: // Volume up
            case 175: // Volume down
                return null
            default:
                return evt.key
        }
    }
}
