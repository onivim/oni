import { EventEmitter } from "events"

import { IScreen } from "./../Screen"

import { IWindow, NeovimInstance } from "./index"

export class NeovimWindowManager extends EventEmitter {

    private _screen: IScreen
    private _neovimInstance: NeovimInstance

    constructor(screen: IScreen, neovimInstance: NeovimInstance) {
        super()

        this._screen = screen
        this._neovimInstance = neovimInstance
    }

    public notifyWindowDimensionsChanged(eventContext: Oni.EventContext, data: any) {

        let win: IWindow

        this._neovimInstance.getCurrentWindow()
            .then((currentWindow) => win = currentWindow)
            .then(() => win.getDimensions())
            .then((dimensions)  => {
                const windowStartRow = dimensions.row
                const windowStartColumn = dimensions.col

                const dimensionsInPixels = {
                    x: windowStartColumn * this._screen.fontWidthInPixels,
                    y: windowStartRow * this._screen.fontHeightInPixels,
                    width: dimensions.width * this._screen.fontWidthInPixels,
                    height: dimensions.height * this._screen.fontHeightInPixels,
                }

                this.emit("current-window-size-changed", dimensionsInPixels, eventContext.windowNumber)
            })
    }
}
