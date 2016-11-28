import * as path from "path"

import { IOverlay, IWindowContext } from "./../OverlayManager"
import { renderErrorMarkers } from "./../components/Error"

export class ErrorOverlay implements IOverlay {

    private _element: HTMLElement
    private _errors: { [fileName: string]: Oni.Plugin.Diagnostics.Error[] } = {}
    private _currentFileName: string
    private _lastWindowContext: IWindowContext
    private _columnOffset: number
    private _currentLine: number

    public onVimEvent(eventName: string, eventContext: Oni.EventContext): void {
        const fullPath = eventContext.bufferFullPath
        this._currentFileName = fullPath

        this._showErrors()
    }

    public setErrors(key: string, fileName: string, errors: Oni.Plugin.Diagnostics.Error[], color?: string): void {
        fileName = path.normalize(fileName)
        this._errors[fileName] = errors

        this._showErrors()
    }

    public update(element: HTMLElement, windowContext: IWindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._showErrors()
    }

    private _showErrors(): void {

        if (!this._currentFileName)
            return

        if (!this._element)
            return

        if (!this._errors) {
            this._element.textContent = ""
            return
        }

        renderErrorMarkers({
            errors: this._errors[this._currentFileName],
            windowContext: this._lastWindowContext
        }, this._element)
    }
}
