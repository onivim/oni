import { Screen } from "./../Screen"
import * as _ from "lodash"

export interface WindowDimensions {
    width: number;
    height: number
}

/**
 * These interfaces must be kept in sync with the window_display_update method in init.vim
 */
export interface WindowMappingData {
    dimensions: WindowDimensions
    mapping: any
}

export interface IWindowContext {
    dimensions: WindowDimensions

    fontHeightInPixels: number
    fontWidthInPixels: number

    startLine: number
    endLine: number

    lineCount: number;

    lineToPositionMap: any

    getRegionForLine(line: number): PixelRectangle
}

export interface PixelRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

class WindowContext implements IWindowContext {

    private _fontHeightInPixels: number
    private _fontWidthInPixels: number
    private _lineMapping: any
    private _dimensions: WindowDimensions

    public get dimensions(): WindowDimensions {
        return this._dimensions
    }

    public get startLine(): number {
        return -1 // TODO
    }

    public get endLine(): number {
        return -1 // TODO
    }

    public get lineCount(): number {
        return -1 // TODO
    }

    public get fontHeightInPixels(): number {
        return this._fontHeightInPixels
    }

    public get fontWidthInPixels(): number {
        return this._fontWidthInPixels
    }

    public get lineToPositionMap(): string {
        return this._lineMapping
    }

    public getRegionForLine(line: number) {
        return null
    }

    constructor(windowData: WindowMappingData, fontWidthInPixels: number, fontHeightInPixels: number) {
        this._fontHeightInPixels = fontHeightInPixels
        this._fontWidthInPixels = fontWidthInPixels
        this._dimensions = windowData.dimensions
        this._lineMapping = windowData.mapping
    }
}

export interface IOverlay {
    update(element: HTMLElement, windowContext: IWindowContext)
}

interface OverlayInfo {
    overlay: IOverlay
    element: HTMLElement
}

export class OverlayManager {

    private _screen: Screen
    private _containerElement: HTMLElement;

    private _lastEventContext: any
    private _lastWindowData: WindowMappingData

    private _overlays: {[key:string]: OverlayInfo} = {}

    constructor(screen: Screen) {
        this._screen = screen

        const div = document.createElement("div");
        div.style.position = "absolute"
        div.style.top = "0px"
        div.style.left = "0px"
        div.style.width = "100px"
        div.style.height = "100px"
        document.body.appendChild(div)
        this._containerElement = div

    }

    public addOverlay(key: string, overlay: IOverlay): void {
        const overlayContainer = document.createElement("div")
        overlayContainer.className = "overlay-container"

        this._containerElement.appendChild(overlayContainer)

        this._overlays[key] = {
            overlay: overlay,
            element: overlayContainer
        }
    }

    public handleCursorMovedEvent(eventContext: any): void {
        this._lastEventContext = eventContext
        this._redrawWithDelay()
    }

    public notifyWindowDimensionsChanged(data: WindowMappingData) {
        this._lastWindowData = data

        this._redrawWithDelay()
    }

    private _redrawWithDelay(): void {
        setTimeout(() => this._redrawElement(), 250)
    }

    private _redrawElement(): void {

        if(!this._lastWindowData || !this._lastEventContext)
            return

        const windowStartRow = this._screen.cursorRow - this._lastEventContext.winline + 1
        const windowStartColumn = this._screen.cursorColumn - this._lastEventContext.wincol + 1

        this._containerElement.style.top = (windowStartRow * this._screen.fontHeightInPixels) + "px"
        this._containerElement.style.left = (windowStartColumn * this._screen.fontWidthInPixels) + "px"

        const width = (this._lastWindowData.dimensions.width * this._screen.fontWidthInPixels) + "px"
        const height = (this._lastWindowData.dimensions.height * this._screen.fontHeightInPixels) + "px"

        this._containerElement.style.width = width
        this._containerElement.style.height = height

        const windowContext = new WindowContext(this._lastWindowData, this._screen.fontWidthInPixels, this._screen.fontHeightInPixels)

        _.values(this._overlays).forEach(overlayInfo => {
            overlayInfo.overlay.update(overlayInfo.element, windowContext)
        })
    }
}
