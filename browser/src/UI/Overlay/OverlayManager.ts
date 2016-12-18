import * as _ from "lodash"

import { IWindow } from "./../../neovim/Window"
import { NeovimInstance } from "./../../NeovimInstance"
import { IScreen } from "./../../Screen"
import { WindowContext } from "./WindowContext"

export interface IOverlay {
    update(element: HTMLElement, windowContext: WindowContext): void
}

interface IOverlayInfo {
    overlay: IOverlay
    element: HTMLElement
}

export class OverlayManager {

    private _screen: IScreen
    private _containerElement: HTMLElement

    private _lastEventContext: Oni.EventContext
    private _lastWindowData: any

    private _overlays: { [key: string]: IOverlayInfo } = {}
    private _neovimInstance: NeovimInstance

    constructor(screen: IScreen, neovimInstance: NeovimInstance) {
        this._screen = screen

        const div = document.createElement("div")
        div.style.position = "absolute"
        div.style.top = "0px"
        div.style.left = "0px"
        div.style.width = "100px"
        div.style.height = "100px"
        document.body.appendChild(div)
        this._containerElement = div

        this._neovimInstance = neovimInstance
    }

    public addOverlay(key: string, overlay: IOverlay): void {
        const overlayContainer = document.createElement("div")
        overlayContainer.className = "overlay-container"

        this._containerElement.appendChild(overlayContainer)

        this._overlays[key] = {
            overlay,
            element: overlayContainer,
        }
    }

    public notifyWindowDimensionsChanged(eventContext: Oni.EventContext, data: any) {
        this._lastEventContext = eventContext
        this._lastWindowData = data

        this._redrawWithDelay()
    }

    private _redrawWithDelay(): void {
        setTimeout(() => this._redrawElement(), 250)
    }

    private _redrawElement(): void {

        if (!this._lastWindowData || !this._lastEventContext) {
            return
        }

        let win: IWindow

        this._neovimInstance.getCurrentWindow()
            .then((currentWindow) => win = currentWindow)
            .then(() => win.getDimensions())
            .then((dimensions)  => {
                const windowStartRow = dimensions.row
                const windowStartColumn = dimensions.col

                this._containerElement.style.top = (windowStartRow * this._screen.fontHeightInPixels) + "px"
                this._containerElement.style.left = (windowStartColumn * this._screen.fontWidthInPixels) + "px"

                const width = (dimensions.width * this._screen.fontWidthInPixels) + "px"
                const height = (dimensions.height * this._screen.fontHeightInPixels) + "px"

                this._containerElement.style.width = width
                this._containerElement.style.height = height

                const windowContext = new WindowContext(this._lastWindowData, dimensions, this._screen.fontWidthInPixels, this._screen.fontHeightInPixels, this._lastEventContext)

                _.values(this._overlays).forEach((overlayInfo) => {
                    overlayInfo.overlay.update(overlayInfo.element, windowContext)
                })

            })
    }
}
