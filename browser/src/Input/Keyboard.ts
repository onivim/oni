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

       const keyCode = {
             8:  "bs",      // Backspace                 
             9:  "tab",     // Tab                 
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
             16:  null,     // Shift left
             17:  null,     // Ctrl left
             18:  null,     // Alt left
             19:  null,     // Pause
             20:  null,     // Caps lock
             145: null,     // Scroll lock
             174: null,     // Volume up
             175: null,     // Volume down                
        }

       return keyCode[evt.keyCode ] ? keyCode[evt.keyCode ] : evt.key

    }
}
