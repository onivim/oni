import { EventEmitter } from "events"
import { IScreen } from "./../Screen"

// interface ScreenPoint {
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
            }
        })

        document.body.addEventListener("mouseup", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            this.emit("mouse", `<LeftRelease><${line},${column}>`)
            this._isDragging = false
        })
    }

    private _convertEventToPosition(evt: MouseEvent): { line: number; column: number } {
        const mouseX = evt.clientX
        const mouseY = evt.clientY

        return {
            line: Math.round(mouseX / this._screen.fontWidthInPixels),
            column: Math.round(mouseY / this._screen.fontHeightInPixels),
        }
    }
}
