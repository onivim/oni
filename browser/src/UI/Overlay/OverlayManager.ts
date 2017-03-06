import { EventEmitter } from "events"

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

export class OverlayManager extends EventEmitter {

    private _screen: IScreen
    private _containerElement: HTMLElement

    private _lastEventContext: Oni.EventContext
    private _lastWindowData: any

    private _overlays: { [key: string]: IOverlayInfo } = {}
    private _neovimInstance: NeovimInstance

    constructor(screen: IScreen, neovimInstance: NeovimInstance) {
        super()

        this._screen = screen

        // TODO: Refactor to component
        const div = document.createElement("div")
        div.style.position = "absolute"
        div.style.top = "0px"
        div.style.left = "0px"
        div.style.width = "100px"
        div.style.height = "100px"

        // This is not a long-term solution, and to make things like mouse-events
        // work on buffer scroll, or be useful for errors, we'll need to remove this
        // and move this element to a proper spot in the DOM.
        div.style.pointerEvents = "none"
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

                const dimensionsInPixels = {
                    x: windowStartColumn * this._screen.fontWidthInPixels,
                    y: windowStartRow * this._screen.fontHeightInPixels,
                    width: dimensions.width * this._screen.fontWidthInPixels,
                    height: dimensions.height * this._screen.fontHeightInPixels,
                }

                this._containerElement.style.top = (dimensionsInPixels.y) + "px"
                this._containerElement.style.left = (dimensionsInPixels.x) + "px"

                const width = (dimensionsInPixels.width) + "px"
                const height = (dimensionsInPixels.height) + "px"

                this._containerElement.style.width = width
                this._containerElement.style.height = height

                const windowContext = new WindowContext(this._lastWindowData, dimensions, this._screen.fontWidthInPixels, this._screen.fontHeightInPixels, this._lastEventContext)

                _.values(this._overlays).forEach((overlayInfo) => {
                    overlayInfo.overlay.update(overlayInfo.element, windowContext)
                })

                this.emit("current-window-size-changed", dimensionsInPixels)
            })
    }
}
