import * as _ from "lodash"
import { IScreen } from "./../../Screen"
import { NeovimInstance } from "./../../NeovimInstance"

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

        // TODO:
        // Expose getWindows() from NeovimInstance
        // Get dimensions (position / height) from each window
        // **Initial check-in - use this to calculate positions initially
        //
        // Create dictionary keyed by window Id -> window instance (IWindowOverlayContainer)
        // Expose events
        //  new window
        //  window dimensions changed
        //  window closed
        // Update corresponding IWindowOverlayContainer
        // **Check-in two - still no need for factories
        //
        // Update IWindowOverlayContainer with new mapping data
        // Update overlays to be driven by factories, so there can be elements for each window
        //          (for example, dont' lose error markers / scrollbar when switching windows)
        // ** Check-in three - this will enable per-window scrollbars / errors / etc
        // Interop with plugins - send these events to plugins
        //
        // ** Separate work
        // Refactor plugins to use <webview> tag and be able to render UI
        //
        // ** Once that is all done... can start to tackle #49 (Markdown preview). This would open
        // lots of other interesting scenarios up to - plugins would be able to render all sorts of UI.
        // Would be really nice for a 'git blame' overlay as well

        const windowStartRow = this._screen.cursorRow - this._lastEventContext.winline + 1
        const windowStartColumn = this._screen.cursorColumn - this._lastEventContext.wincol + 1

        this._containerElement.style.top = (windowStartRow * this._screen.fontHeightInPixels) + "px"
        this._containerElement.style.left = (windowStartColumn * this._screen.fontWidthInPixels) + "px"

        const width = (this._lastWindowData.dimensions.width * this._screen.fontWidthInPixels) + "px"
        const height = (this._lastWindowData.dimensions.height * this._screen.fontHeightInPixels) + "px"

        this._containerElement.style.width = width
        this._containerElement.style.height = height

        const windowContext = new WindowContext(this._lastWindowData, this._screen.fontWidthInPixels, this._screen.fontHeightInPixels, this._lastEventContext)

        _.values(this._overlays).forEach((overlayInfo) => {
            overlayInfo.overlay.update(overlayInfo.element, windowContext)
        })
    }
}
