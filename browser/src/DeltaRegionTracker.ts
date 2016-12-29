import * as Config from "./Config"
import { Grid } from "./Grid"

export interface IDeltaCellPosition {
    x: number
    y: number
    force?: boolean
}

export interface IDeltaRegionTracker {
    getModifiedCells(): IDeltaCellPosition[]
    notifyCellModified(x: number, y: number, force?: boolean): void
    notifyCellRendered(x: number, y: number): void
}

/**
 * This strategy doesn't help much in practice, as
 * often there are UI elements at the bounds, that
 * cause the entire screen to be invalidated anyway
 */
export class IncrementalDeltaRegionTracker implements IDeltaRegionTracker {

    // private _screen: Screen;
    private _cells: IDeltaCellPosition[]

    private _dirtyGrid: Grid<boolean> = new Grid<boolean>()

    private _debugDiv: null | Element

    constructor() {
        this._reset()

        if (Config.hasValue("debug.incrementalRenderRegions")) {
            const div = document.createElement("div")
            document.body.appendChild(div)
            div.style.position = "absolute"
            div.style.top = "0px"
            div.style.left = "0px"
            div.style.backgroundColor = "blue"
            this._debugDiv = div
        }
    }

    public dirtyAllCells(): void {
        this._reset()
    }

    public notifyCellRendered(x: number, y: number): void {
        this._dirtyGrid.setCell(x, y, false)
    }

    public cleanUpRenderedCells(): void {
        this._cells = this._cells.filter((dcp) => this._dirtyGrid.getCell(dcp.x, dcp.y))
    }

    public notifyCellModified(x: number, y: number, force?: boolean): void {
        if (this._dirtyGrid.getCell(x, y) && !force) {
            return
        }

        this._cells.push({
            x,
            y,
            force,
        })

        this._dirtyGrid.setCell(x, y, true)
    }

    public getModifiedCells(): IDeltaCellPosition[] {
        if (this._debugDiv) {
            this._debugDiv.textContent = "Modified: " + this._cells.length
        }

        return this._cells
    }

    private _reset(): void {
        this._cells = []
        this._dirtyGrid.clear()
    }
}
