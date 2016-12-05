export class Grid<T> {
    private _cells: any = {}

    private _width: number = 0
    private _height: number = 0

    public get width(): number {
        return this._width
    }

    public get height(): number {
        return this._height
    }

    public getCell(x: number, y: number): null | T {
        const row = this._cells[y]

        if (!row) {
            return null
        }

        const col = row[x]

        if (typeof col === "undefined") {
            return null
        }

        return col
    }

    public setCell(x: number, y: number, val: T | null) {

        let row = this._cells[y]
        row = row || {}
        row[x] = val
        this._cells[y] = row

        if (x >= this._width) {
            this._width = x + 1
        }

        if (y >= this._height) {
            this._height = y + 1
        }
    }

    public clear(): void {
        this._cells = {}
        this._width = 0
        this._height = 0
    }

    public shiftRows(rowsToShift: number): void {
        // var val = typeof defaultVal === "undefined" ? null : defaultVal

        let dir: any
        let start: any
        let end: any

        if (rowsToShift >= 0) {
            dir = 1
            start = 0
            end = this._height
        } else {
            dir = -1
            start = this._height - 1
            end = 0
        }

        let current = start

        while (current >= 0 && current < this._height) {

            const srcRow = current + rowsToShift

            for (let x = 0; x < this._width; x++) {
                const oldCell = this.getCell(x, srcRow)
                this.setCell(x, current, <any> oldCell)
            }

            current += dir
        }
    }

    public setRegionFromGrid(grid: Grid<T>, xPosition: number, yPosition: number): void {
        for (let x = 0; x < grid.width; x++) {
            for (let y = 0; y < grid.height; y++) {
                const sourceCell = grid.getCell(x, y)
                this.setCell(xPosition + x, yPosition + y, sourceCell)
            }
        }
    }

    public setRegion(startX: number, startY: number, width: number, height: number, val?: T | null): void {
        const valToSet = typeof val === "undefined" ? null : val
        for (let x = startX; x < startX + width; x++) {
            for (let y = startY; y < startY + height; y++) {
                this.setCell(x, y, valToSet)
            }
        }
    }

    public cloneRegion(x: number, y: number, width: number, height: number): Grid<T> {
        const outputGrid = new Grid<T>()
        for (let cloneX = 0; cloneX < width; cloneX++) {
            for (let cloneY = 0; cloneY < height; cloneY++) {
                const sourceCell = this.getCell(cloneX + x, cloneY + y)
                outputGrid.setCell(cloneX, cloneY, sourceCell)
            }
        }

        return outputGrid
    }
}
