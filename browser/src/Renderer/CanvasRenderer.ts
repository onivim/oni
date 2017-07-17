// import { /* IDeltaCellPosition, */ IDeltaRegionTracker } from "./../DeltaRegionTracker"
// import { Grid } from "./../Grid"
// import * as Performance from "./../Performance"
// import { IScreen } from "./../Screen"
import { INeovimRenderer } from "./INeovimRenderer"

export class CanvasRenderer implements INeovimRenderer {
    private _editorElement: HTMLDivElement
    // private _grid: Grid<ISpanElementInfo> = new Grid<ISpanElementInfo>()

    public start(element: HTMLDivElement): void {
        this._editorElement = element

        this._editorElement.textContent = "Hello World"
    }

    public onAction(_action: any): void {
        // No-op
    }

    public onResize(): void {
        // No-op
    }

    public update(/* screenInfo: IScreen, deltaRegionTracker: IDeltaRegionTracker */): void {

    }
}

