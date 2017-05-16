import * as _ from "lodash"
import { IScrollBarMarker, renderBufferScrollBar } from "./../components/BufferScrollBar"
import { IOverlay } from "./../Overlay/OverlayManager"
import { WindowContext } from "./../Overlay/WindowContext"

export interface IKeyToMarkers {
    [key: string]: IScrollBarMarker[]
}

export interface IFileToAllMarkers {
    [filePath: string]: IKeyToMarkers
}

export class ScrollBarOverlay implements IOverlay {

    private _element: HTMLElement
    // private _currentFileName: string
    private _currentFileLength: number
    // private _windowTop: number
    // private _windowBottom: number
    private _lastWindowContext: WindowContext
    private _lastEvent: Oni.EventContext

    private _fileToMarkers: IFileToAllMarkers = {}

    public onBufferUpdate(_eventContext: Oni.EventContext, lines: string[]): void {
        this._currentFileLength = lines.length
    }

    public onVimEvent(_eventName: string, eventContext: Oni.EventContext): void {
        // const fullPath = eventContext.bufferFullPath

        this._lastEvent = eventContext

        const cursorMarker: IScrollBarMarker = {
            line: eventContext.line,
            height: 1,
            color: "rgb(200, 200, 200)",
        }

        this.setMarkers(<string> eventContext.bufferFullPath, "cursor", [cursorMarker])

        this._updateScrollBar()
    }

    public setMarkers(file: string, key: string, markers: IScrollBarMarker[]): void {
        const curFileToMarker = this._fileToMarkers[file] || {}
        curFileToMarker[key] = curFileToMarker[key] || []
        curFileToMarker[key] = markers
        this._fileToMarkers[file] = curFileToMarker

        this._updateScrollBar()
    }

    public update(element: HTMLElement, windowContext: WindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._updateScrollBar()
    }

    private _updateScrollBar(): void {

        if (!this._element) {
            return
        }

        if (!this._lastEvent) {
            return
        }

        const allMarkers = this._fileToMarkers[this._lastEvent.bufferFullPath]

        const markers = _.flatten(_.values(allMarkers))

        renderBufferScrollBar({
            markers,
            bufferSize: this._lastEvent.bufferTotalLines,
            windowTopLine: this._lastEvent.windowTopLine,
            windowBottomLine: this._lastEvent.windowBottomLine,
        }, this._element)
    }
}
