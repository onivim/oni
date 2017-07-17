// import { /* IDeltaCellPosition, */ IDeltaRegionTracker } from "./../DeltaRegionTracker"
// import { Grid } from "./../Grid"
// import * as Performance from "./../Performance"
// import { IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

export class CanvasRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    private _canvasElement: HTMLCanvasElement
    private _canvasContext: CanvasRenderingContext2D
    // private _grid: Grid<ISpanElementInfo> = new Grid<ISpanElementInfo>()

    public start(element: HTMLDivElement): void {
        this._editorElement = element

        this._canvasElement = document.createElement("canvas")
        this._canvasElement.style.width = "100%"
        this._canvasElement.style.height = "100%"

        this._canvasContext = this._canvasElement.getContext("2d")

        this._editorElement.appendChild(this._canvasElement)

        this._setContextDimensions()
    }

    public onAction(_action: any): void {
        // No-op
    }

    public onResize(): void {
        // No-op
        this._setContextDimensions()
    }

    public update(/* screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker */): void {
        this._canvasContext.fillStyle = "red"
        this._canvasContext.fillRect(0, 0, 20, 20)
    }

    private _setContextDimensions(): void {
        this._canvasElement.width = this._canvasElement.offsetWidth * this._getPixelRatio()
        this._canvasElement.height = this._canvasElement.offsetHeight * this._getPixelRatio()
    }

    private _getPixelRatio(): number {
        // TODO: Does the `backingStoreContext` need to be taken into account?
        // I believe this value should be consistent - at least on the electron platform
        return window.devicePixelRatio
    }
}

