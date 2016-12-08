
import { EventEmitter } from "events"

import { IScreen } from "./../Screen"

// interface IScreenPoint {
//     line: number
//     column: number
// }

// TODO
// Handle modifier keys
export class Mouse extends EventEmitter {

    private _canvasElement: HTMLCanvasElement
    private _screen: IScreen
    private _isDragging = false

    constructor(canvasElement: HTMLCanvasElement, screen: IScreen) {
        super()

        this._canvasElement = canvasElement
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
        })

        document.body.addEventListener("mouseup", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            this.emit("mouse", `<LeftRelease><${line},${column}>`)
            this._isDragging = false
        })

        // The internet told me 'mousewheel' is deprecated and use this. 
        document.body.addEventListener("wheel", (evt: WheelEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            var scrollcmdY = `<` 
            var scrollcmdX = `<` 
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
                this.emit("mouse",scrollcmdY)
            }
            /*
             * This doesn't seem to do anything
            if (evt.deltaX) {
                if (evt.deltaX < 0) {
                    scrollcmdX += `ScrollWheeLeft>`
                } else {
                    scrollcmdX += `ScrollWheelRight>`
                }
                this.emit("mouse",scrollcmdX)
            }
            */
            this._isDragging = false
            
        })
    }

        const mouseX = evt.clientX
        private _convertEventToPosition(evt: MouseEvent): { line: number; column: number } {private _convertEventToPosition(evt: MouseEvent) {
        const mouseY = evt.clientY

        return {
            line: Math.round(mouseX / this._screen.fontWidthInPixels),
            column: Math.round(mouseY / this._screen.fontHeightInPixels),
        }
    }
}
