import * as path from "path"
import * as _ from "lodash"

import { renderErrorMarkers, ErrorWithColor } from "./../components/Error"
import { IOverlay } from "./OverlayManager"
import { WindowContext } from "./WindowContext"

export class ErrorOverlay implements IOverlay {

    private _element: HTMLElement
    private _errors: { [fileName: string]: ErrorWithColor[] } = {}
    private _currentFileName: string
    private _lastWindowContext: WindowContext

    public onVimEvent(_eventName: string, eventContext: Oni.EventContext): void {
        const fullPath = eventContext.bufferFullPath
        this._currentFileName = fullPath

        this._showErrors()
    }

    public setErrors(key: string, fileName: string, errors: Oni.Plugin.Diagnostics.Error[], color: string): void {
        fileName = path.normalize(fileName)
        color = color || "red"
        this._errors[fileName] = this._errors[fileName] || {}
        this._errors[fileName][key] = errors.map(e => ({...e, color }))

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

        const errors = this._errors[this._currentFileName]
        let allErrors: ErrorWithColor[] = []

        if (errors) {
            allErrors = _.flatten<ErrorWithColor>(_.values<ErrorWithColor>(errors))
        }

        renderErrorMarkers({
            errors: allErrors,
            windowContext: this._lastWindowContext,
        }, this._element)
    }
}
