

export class Grid<T> {
    private _cells: any = {};

    private _width: number = 0
    private _height: number = 0

    public get width(): number {
        return this._width
    }

    public get height(): number {
        return this._height
    }

    public getCell(x: number, y: number): null | T {
        var row = this._cells[y];

        if(!row)
            return null;

        var col = row[x];

        if(!col)
            return null;

        return col;
    }

    public setCell(x: number, y: number, val: T) {

        var row = this._cells[y];
        row = row || { };
        row[x] = val;
        this._cells[y] = row;

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

    public shiftRows(rowsToShift: number, _defaultVal?: T): void {
        // var val = typeof defaultVal === "undefined" ? null : defaultVal

        let dir: number, start: number, end: number

        if(rowsToShift >= 0) {
            dir = 1
            start = 0
            end = this._height
        } else {
            dir = -1
            start = this._height -1
            end = 0
        }

        let current = start

        while(current >= 0 && current < this._height) {

            var srcRow = current + rowsToShift

            for(var x = 0; x < this._width; x++) {
                var oldCell = this.getCell(x, srcRow)
                oldCell && this.setCell(x, current, oldCell)
            }

            current += dir
        }
    }

    public setRegionFromGrid(grid: Grid<T>, xPosition: number, yPosition: number): void {
        for(var x = 0; x < grid.width; x++) {
            for(var y = 0; y < grid.height; y++) {
                var sourceCell = grid.getCell(x, y)
                sourceCell && this.setCell(xPosition + x, yPosition + y, sourceCell)
            }
        }
    }


    public setRegion(startX: number, startY: number, width: number, height: number, val?: T): void {
        var valToSet = typeof val === "undefined" ? null : val

        for(var x = startX; x < startX + width; x++) {
            for(var y = startY; y < startY + height; y++) {
                valToSet && this.setCell(x, y, valToSet)
            }
        }
    }

    public cloneRegion(x: number, y: number, width: number, height: number): Grid<T> {
        var outputGrid = new Grid<T>();

        for(var cloneX = 0; cloneX < width; cloneX++) {
            for(var cloneY = 0; cloneY < height; cloneY++) {
                var sourceCell = this.getCell(cloneX + x, cloneY + y)
                sourceCell && outputGrid.setCell(cloneX, cloneY, sourceCell)
            }
        }

        return outputGrid
    }
}
