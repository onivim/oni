import { /*Action,*/ UPDATE_FG, /*UpdateColorAction*/ } from "./actions"
import { Screen } from "./Screen"

export class Cursor {
    private _cursorElement: HTMLElement;

    constructor() {
        var cursorElement = document.createElement("div")
        cursorElement.style.position = "absolute"
        this._cursorElement = cursorElement
        this._cursorElement.style.backgroundColor = "red"
        this._cursorElement.style.opacity = "0.5"
        this._cursorElement.className = "cursor"
        document.body.appendChild(cursorElement)
    }

    update(screen: Screen): void {
        var cursorRow = screen.cursorRow;
        var cursorColumn = screen.cursorColumn;

        var fontWidthInPixels = screen.fontWidthInPixels
        var fontHeightInPixels = screen.fontHeightInPixels

        this._cursorElement.style.top = (cursorRow * fontHeightInPixels) + "px"
        this._cursorElement.style.left = (cursorColumn * fontWidthInPixels) + "px"

        var width = screen.mode === "normal" ? fontWidthInPixels : fontWidthInPixels / 4;
        this._cursorElement.style.width = width + "px"
        this._cursorElement.style.height = fontHeightInPixels + "px"

    }

    dispatch(action: any): void {

        if(action.type === UPDATE_FG) {
            this._cursorElement.style.backgroundColor = action.color
        }
    }
}
