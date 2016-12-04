import { UPDATE_FG } from "./actions"
import { IScreen } from "./Screen"

export class Cursor {
    private _cursorElement: HTMLElement

    constructor() {
        const cursorElement = document.createElement("div")
        cursorElement.style.position = "absolute"
        this._cursorElement = cursorElement
        this._cursorElement.style.backgroundColor = "red"
        this._cursorElement.style.opacity = "0.5"
        this._cursorElement.className = "cursor"
        document.body.appendChild(cursorElement)
    }

    public update(screen: IScreen): void {
        const cursorRow = screen.cursorRow
        const cursorColumn = screen.cursorColumn

        const fontWidthInPixels = screen.fontWidthInPixels
        const fontHeightInPixels = screen.fontHeightInPixels

        this._cursorElement.style.top = (cursorRow * fontHeightInPixels) + "px"
        this._cursorElement.style.left = (cursorColumn * fontWidthInPixels) + "px"

        const width = screen.mode === "normal" ? fontWidthInPixels : fontWidthInPixels / 4
        this._cursorElement.style.width = width + "px"
        this._cursorElement.style.height = fontHeightInPixels + "px"

    }

    public dispatch(action: any): void {
        if (action.type === UPDATE_FG) {
            this._cursorElement.style.backgroundColor = action.color
        }
    }
}
