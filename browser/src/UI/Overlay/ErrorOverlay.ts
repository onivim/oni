import * as path from "path"
import { renderErrorMarkers } from "./../components/Error"
import { IOverlay } from "./OverlayManager"
import { WindowContext } from "./WindowContext"

export class ErrorOverlay implements IOverlay {

    private _element: HTMLElement
    private _errors: { [fileName: string]: Oni.Plugin.Diagnostics.Error[] } = {}
    private _currentFileName: string
    private _lastWindowContext: WindowContext

    public onVimEvent(_eventName: string, eventContext: Oni.EventContext): void {
        const fullPath = eventContext.bufferFullPath
        this._currentFileName = fullPath

        this._showErrors()
    }

    public setErrors(_key: string, fileName: string, errors: Oni.Plugin.Diagnostics.Error[], _color?: string): void {
        fileName = path.normalize(fileName)
        this._errors[fileName] = errors

        this._showErrors()
    }

    public update(element: HTMLElement, windowContext: WindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._showErrors()
    }

    private _showErrors(): void {

        if (!this._currentFileName) {
            return
        }

        if (!this._element) {
            return
        }

        if (!this._errors) {
            this._element.textContent = ""
            return
        }

        renderErrorMarkers({
            errors: this._errors[this._currentFileName],
            windowContext: this._lastWindowContext,
        }, this._element)
    }
}
