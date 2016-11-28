import * as path from "path"

import { IOverlay, IWindowContext } from "./../OverlayManager"
import { LiveCodeBlock } from "./../../Services/LiveEvaluation"
import { renderLiveEval } from "./../components/LiveEvalMarker"

export class LiveEvaluationOverlay implements IOverlay {

    private _element: HTMLElement
    private _lastWindowContext: IWindowContext
    private _lastEvalResults: LiveCodeBlock[]

    public setLiveEvaluationResults(codeBlocks: LiveCodeBlock[]): void {
        this._lastEvalResults = codeBlocks
        this._showLiveEval()
    }

    public update(element: HTMLElement, windowContext: IWindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._showLiveEval()
    }

    private _showLiveEval(): void {

        if (!this._lastEvalResults) {
            this._element.textContent = ""
            return
        }

        if (!this._element)
            return

        renderLiveEval({
            blocks: this._lastEvalResults,
            windowContext: this._lastWindowContext
        }, this._element)
    }
}
