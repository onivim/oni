import { EventEmitter } from "events"
import { IScreen } from "./../Screen"

// TODO
// Handle modifier keys
export class Mouse extends EventEmitter {

    private _editorElement: HTMLDivElement
    private _screen: IScreen
    private _isDragging = false

    constructor(editorElement: HTMLDivElement, screen: IScreen) {
        super()

        this._editorElement = editorElement
        this._screen = screen

        document.body.addEventListener("mousedown", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            this.emit("mouse", `<LeftMouse><${line},${column}>`)
            this._isDragging = true
        })

        document.body.addEventListener("mousemove", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            if (this._isDragging) {
                this.emit("mouse", `<LeftDrag><${line},${column}>`)
            }
        })

        document.body.addEventListener("mouseup", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            this.emit("mouse", `<LeftRelease><${line},${column}>`)
            this._isDragging = false
        })

        // The internet told me 'mousewheel' is deprecated and use this.
        document.body.addEventListener("wheel", (evt: WheelEvent) => {
            const { line, column } = this._convertEventToPosition(evt)
            let scrollcmdY = `<`
            let scrollcmdX = `<`
            if (evt.ctrlKey || evt.shiftKey) {
                scrollcmdY += `C-` // The S- and C- prefixes have the same effect
                scrollcmdX += `C-`
            }

            // This is 'less than' because I made this on a mac to behave just like
            // the other applications I use. However, because OSX is super weird, it
            // might be backwards
            if (evt.deltaY) {
                if (evt.deltaY < 0) {
                    scrollcmdY += `ScrollWheelUp>`
                } else {
                    scrollcmdY += `ScrollWheelDown>`
                }
                this.emit("mouse", scrollcmdY + `<${line},${column}>`)
            }

            this._isDragging = false

        })
    }

    private _convertEventToPosition(evt: MouseEvent): { line: number; column: number } {
        const mouseX = evt.clientX
        const mouseY = evt.clientY

        return {
            line: Math.floor(mouseX / this._screen.fontWidthInPixels),
            column: Math.floor(mouseY / this._screen.fontHeightInPixels),
        }
    }
}
