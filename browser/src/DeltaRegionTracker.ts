import * as Actions from "./actions"

import { Screen } from "./Screen"
import { Grid } from "./Grid"
import * as Config from "./Config"

export interface DeltaCellPosition {
    x: number;
    y: number;
}

export interface DeltaRegionTracker {
    getModifiedCells(): DeltaCellPosition[]
    notifyCellModified(x: number, y: number): void
    clearModifiedCells(): void
}

/**
 * This strategy doesn't help much in practice, as
 * often there are UI elements at the bounds, that
 * cause the entire screen to be invalidated anyway
 */
export class IncrementalDeltaRegionTracker implements DeltaRegionTracker {

    private _screen: Screen;
    private _cells: DeltaCellPosition[]

    private _dirtyGrid: Grid<boolean> = new Grid<boolean>()

    private _debugDiv;

    constructor() {
        this._reset()

        if (Config.hasValue("debug.incrementalRenderRegions")) {
            var div = document.createElement("div")
            document.body.appendChild(div)
            div.style.position = "absolute"
            div.style.top = "0px"
            div.style.left = "0px"
            div.style.backgroundColor = "blue"
            this._debugDiv = div
        }
    }

    public clearModifiedCells(): void {
        this._reset()
    }

    public notifyCellModified(x: number, y: number): void {
        if(this._dirtyGrid.getCell(x,y)) {
            return
        }


        this._cells.push({
            x: x,
            y: y
        })

        this._dirtyGrid.setCell(x, y, true)
    }

    public getModifiedCells(): DeltaCellPosition[] {
        if(this._debugDiv)
            this._debugDiv.textContent = "Modified: " + this._cells.length

        return this._cells
    }

    private _reset(): void {
        this._cells = []
        this._dirtyGrid.clear()
    }
}
