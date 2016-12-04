// import * as path from "path"

import * as _ from "lodash"

import { IOverlay, IWindowContext } from "./../OverlayManager"
import { LiveCodeBlock } from "./../../Services/LiveEvaluation"
import { renderLiveEval } from "./../components/LiveEvalMarker"

export class LiveEvaluationOverlay implements IOverlay {

    private _element: HTMLElement
    private _currentFileName: string;
    private _lastWindowContext: IWindowContext
    // private _lastEvalResults: LiveCodeBlock[]

    private _bufferToBlocks: {[buffer: string]:{[id:string]:LiveCodeBlock}} = {}

    public onVimEvent(_eventName: string, eventContext: Oni.EventContext): void {
        const fullPath = eventContext.bufferFullPath
        this._currentFileName = fullPath

        this._showLiveEval()
    }

    public setLiveEvaluationResult(fileName: string, blocks: LiveCodeBlock[]): void {
        const keyMap = _.keyBy(blocks, "startLine")
        this._bufferToBlocks[fileName] = keyMap

        this._showLiveEval()
    }

    public update(element: HTMLElement, windowContext: IWindowContext) {
        this._element = element
        this._lastWindowContext = windowContext

        this._showLiveEval()
    }

    private _showLiveEval(): void {

        if (!this._currentFileName) {
            return
        }

        if (!this._element)
            return

        let liveCodeBlocks = this._bufferToBlocks[this._currentFileName]

        if (!liveCodeBlocks) {
            this._element.textContent = ""
            return
        }

        const blocks = _.values(liveCodeBlocks)

        renderLiveEval({
            blocks: blocks,
            windowContext: this._lastWindowContext
        }, this._element)
    }
}
