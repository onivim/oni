import { Grid } from "./Grid"

export interface IDeltaCellPosition {
    x: number
    y: number
}

export interface IDeltaRegionTracker {
    getModifiedCells(): IDeltaCellPosition[]
    notifyCellModified(x: number, y: number): void
    notifyCellRendered(x: number, y: number): void
}

/**
 * This strategy doesn't help much in practice, as
 * often there are UI elements at the bounds, that
 * cause the entire screen to be invalidated anyway
 */
export class IncrementalDeltaRegionTracker implements IDeltaRegionTracker {

    private _cells: IDeltaCellPosition[]

    private _dirtyGrid: Grid<boolean> = new Grid<boolean>()

    constructor() {
        this._reset()
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

    public notifyCellModified(x: number, y: number): void {
        if (this._dirtyGrid.getCell(x, y)) {
            return
        }

        this._cells.push({
            x,
            y,
        })

        this._dirtyGrid.setCell(x, y, true)
    }

    public getModifiedCells(): IDeltaCellPosition[] {
        return this._cells
    }

    private _reset(): void {
        this._cells = []
        this._dirtyGrid.clear()
    }
}
