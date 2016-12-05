import * as assert from "assert"

import { Grid } from "./../src/Grid"

describe("Grid", () => {

    it("getCell returns correct value", () => {
        const grid = new Grid<string>()

        grid.setCell(1, 1, "a")

        assert.strictEqual(grid.getCell(0, 0), null)
        assert.strictEqual(grid.getCell(1, 1), "a")
    })

    it("width and height are 0 by default", () => {
        const grid = new Grid<void>()

        assert.strictEqual(grid.width, 0)
        assert.strictEqual(grid.height, 0)
    })

    describe("shift", () => {
        it("shift(0) does not shift", () => {
            const val = [
                [1, 2],
                [3, 4],
            ]

            const startGrid = createGridFromNestedArray(val)
            startGrid.shiftRows(0)
            assertGridValues(startGrid, val)
        })

        it("shift(1) shifts upwards", () => {
            const val = [
                [1, 2],
                [3, 4],
            ]

            const startGrid = createGridFromNestedArray(val)
            startGrid.shiftRows(1)

            const expectedOutput = [
                [3, 4],
                [null, null],
            ]
            assertGridValues(startGrid, expectedOutput)
        })

        it("shift(-1) shifts downwards", () => {
            const val = [
                [1, 2],
                [3, 4],
            ]

            const startGrid = createGridFromNestedArray(val)
            startGrid.shiftRows(-1)

            const expectedOutput = [
                [null, null],
                [1, 2],
            ]
            assertGridValues(startGrid, expectedOutput)
        })
    })

    describe("setRegion", () => {
        it("sets value", () => {

            const val = [
                [1, 2],
                [3, 4],
            ]

            const startGrid = createGridFromNestedArray(val)

            startGrid.setRegion(0, 0, 2, 2, 5)

            const expectedVal = [
                [5, 5],
                [5, 5],
            ]

            assertGridValues(startGrid, expectedVal)
        })

        it("sets null correctly", () => {
            const val = [
                [1, 2, 3],
                [3, 4, 5],
                [6, 7, 8],
            ]

            const startGrid = createGridFromNestedArray(val)

            startGrid.setRegion(0, 0, 2, 2, null)

            const expectedOuput = [
                [null, null, 3],
                [null, null, 5],
                [6, 7, 8],
            ]

            assertGridValues(startGrid, expectedOuput)
        })
    })

    describe("cloneRegion", () => {
        it("returns new grid for single item", () => {
            const val = [
                [1, 2],
                [3, 4],
            ]

            const startGrid = createGridFromNestedArray(val)

            const topLeftGrid = startGrid.cloneRegion(0, 0, 1, 1)
            assert.strictEqual(topLeftGrid.width, 1)
            assert.strictEqual(topLeftGrid.height, 1)
            assert.strictEqual(topLeftGrid.getCell(0, 0), 1)

            const bottomRightGrid = startGrid.cloneRegion(1, 1, 1, 1)
            assert.strictEqual(bottomRightGrid.width, 1)
            assert.strictEqual(bottomRightGrid.height, 1)
            assert.strictEqual(bottomRightGrid.getCell(0, 0), 4)
        })

        it("returns square subsection", () => {
            const val = [
                [1, 2, 3],
                [3, 4, 5],
                [6, 7, 8],
            ]

            const startGrid = createGridFromNestedArray(val)

            const topLeftGrid = startGrid.cloneRegion(0, 0, 2, 2)
            assert.strictEqual(topLeftGrid.width, 2)
            assert.strictEqual(topLeftGrid.height, 2)

            const expectedOutput = [
                [1, 2],
                [3, 4],
            ]

            assertGridValues(topLeftGrid, expectedOutput)
        })

        it("handles null & undefined correctly", () => {
            const val = [
                [null, undefined, 3],
                [0, 1, 5],
                [6, 7, 8],
            ]

            const startGrid = createGridFromNestedArray(val)
            const outGrid = startGrid.cloneRegion(0, 0, 2, 2)

            const expectedOutput = [
                [null, null],
                [0, 1],
            ]

            assertGridValues(outGrid, expectedOutput)
        })
    })
})

function createGridFromNestedArray<T>(array: T[][]): Grid<T> {

    const grid = new Grid<T>()

    for (let row = 0; row < array.length; row++) {
        const rowItems = array[row]

        for (let col = 0; col < rowItems.length; col++) {
            const colItem = rowItems[col]

            grid.setCell(col, row, colItem)
        }
    }

    return grid
}

function assertGridValues<T>(grid: Grid<T>, array: T[][]): void {

    for (let row = 0; row < array.length; row++) {
        const rowItems = array[row]

        for (let col = 0; col < rowItems.length; col++) {
            // var colItem = rowItems[col]

            const item = grid.getCell(col, row)
            assert.strictEqual(item, array[row][col], `Validate item at row: ${row} and ${col}`)
        }
    }
}
