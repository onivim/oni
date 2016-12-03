import { EventEmitter } from "events"

export class Keyboard extends EventEmitter {
    constructor() {
        super()

        document.addEventListener("keydown", (evt) => {
            console.log("Keydown: " + evt)

            const mappedKey = this._convertKeyEventToVimKey(evt)

            if(mappedKey)
                this.emit("keydown", mappedKey)

            // Temporary workaround to block closing Window
            // The default electron menu maps C-w to close the window,
            // so we need to stop that. 
            //
            // Later, the menu should be customized to fix this.
            if(mappedKey === "<C-w>" || mappedKey === "<C-r>")
                evt.preventDefault()
        })
    }

    private _convertKeyEventToVimKey(evt: KeyboardEvent): string {
        switch(evt.keyCode) {
            case 8: // Backspace
                return "<bs>"
            case 9: // Tab
                return "<tab>"
            case 13: // Enter
                return "<enter>"
            case 16: // Shift left
            case 17: // Ctrl left
                break
            case 27: // Escape
                return "<esc>"
            case 35:
                return "<end>"
            case 36:
                return "<home>"
            case 37: // ArrowLeft
                return "<left>"
            case 38: // ArrowUp
                return "<up>"
            case 39: // ArrowRight
                return "<right>"
            case 40: // ArrowDown
                return "<down>"
            case 45:
                return "<insert>"
            case 114:
                return "<f3>"
            case 116:
                return "<f5>"
            case 123:
                return "<f12>"
            case 174: // Volume up
            case 175: // Volume down
                return null
            default:
                let key = evt.key;

                if (key === "<")
                    key = "<lt>"

                if (evt.ctrlKey) {
                    key = "<C-" + key + ">"
                }
                return key
        }
    }
}
