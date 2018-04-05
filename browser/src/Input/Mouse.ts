import { EventEmitter } from "events"

import { IScreen } from "./../neovim"

// TODO
// Handle modifier keys
export class Mouse extends EventEmitter {
    private _isDragging = false
    private _scrollDelta = 0

    constructor(private _editorElement: HTMLDivElement, private _screen: IScreen) {
        super()

        this._editorElement.addEventListener("mousedown", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            this.emit("mouse", `<LeftMouse><${line},${column}>`)
            this._isDragging = true
        })

        this._editorElement.addEventListener("mousemove", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            if (this._isDragging) {
                this.emit("mouse", `<LeftDrag><${line},${column}>`)
            }
        })

        this._editorElement.addEventListener("mouseup", (evt: MouseEvent) => {
            const { line, column } = this._convertEventToPosition(evt)

            this.emit("mouse", `<LeftRelease><${line},${column}>`)
            this._isDragging = false
        })

        // The internet told me 'mousewheel' is deprecated and use this.
        this._editorElement.addEventListener("wheel", (evt: WheelEvent) => {
            const { line, column } = this._convertEventToPosition(evt)
            let scrollcmdY = `<`
            if (evt.ctrlKey || evt.shiftKey) {
                scrollcmdY += `C-` // The S- and C- prefixes have the same effect
            }

            // This is 'less than' because I made this on a mac to behave just like
            // the other applications I use. However, because OSX is super weird, it
            // might be backwards
            if (evt.deltaY) {
                this._scrollDelta += evt.deltaY
                if (Math.abs(this._scrollDelta) >= 100) {
                    if (this._scrollDelta < 0) {
                        scrollcmdY += `ScrollWheelUp>`
                    } else {
                        scrollcmdY += `ScrollWheelDown>`
                    }
                    this._scrollDelta = 0
                    this.emit("mouse", scrollcmdY + `<${line},${column}>`)
                }
            }

            this._isDragging = false
        })
    }

    private _convertEventToPosition(evt: MouseEvent): { line: number; column: number } {
        const mouseX = evt.offsetX
        const mouseY = evt.offsetY

        return {
            line: Math.floor(mouseX / this._screen.fontWidthInPixels),
            column: Math.floor(mouseY / this._screen.fontHeightInPixels),
        }
    }
}
