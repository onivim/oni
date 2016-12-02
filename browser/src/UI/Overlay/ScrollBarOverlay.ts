import * as path from "path"

import * as ReactDOM from "react-dom"
import * as _ from "lodash"

import { IOverlay, IWindowContext } from "./../OverlayManager"
import { renderBufferScrollBar, BufferScrollBarProps } from "./../components/BufferScrollBar"

export class ScrollBarOverlay implements IOverlay {

    private _element: HTMLElement
    private _currentFileName: string
    private _currentFileLength: number
    private _windowTop: number
    private _windowBottom: number
    private _lastWindowContext: IWindowContext
    private _lastEvent: Oni.EventContext

    public onBufferUpdate(eventContext: Oni.EventContext, lines: string[]): void {
        this._currentFileLength = lines.length
    }

    public onVimEvent(eventName: string, eventContext: Oni.EventContext): void {
        const fullPath = eventContext.bufferFullPath

        this._lastEvent = eventContext

        this._updateScrollBar()
    }

    public update(element: HTMLElement, windowContext: IWindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._updateScrollBar()
    }

    private _updateScrollBar(): void {

        if (!this._element)
            return

        if (!this._lastEvent)
            return

        renderBufferScrollBar({
            bufferSize: this._lastEvent.bufferTotalLines,
            windowTopLine: this._lastEvent.windowTopLine,
            windowBottomLine: this._lastEvent.windowBottomLine
        }, this._element)
    }
}
