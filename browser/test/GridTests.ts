
import test, { AssertContext } from "ava"

import { Grid } from "../src/Grid"

test("Grid.getCell() returns correct value", t => {
    const grid = new Grid<string>()

    grid.setCell(1, 1, "a")

    t.is(grid.getCell(0, 0), null)
    t.is(grid.getCell(1, 1), "a")
})

test("Grid.width and Grid.height are 0 by default", t => {
    const grid = new Grid<void>()

    t.is(grid.width, 0)
    t.is(grid.height, 0)
})

test("Grid.shiftRows(0) does not shift", t => {
    const val = [
        [1, 2],
        [3, 4],
    ]

    const startGrid = createGridFromNestedArray(val)
    startGrid.shiftRows(0)
    assertGridValues(t, startGrid, val)
})

test("Grid.shiftRows(1) shifts upwards", t => {
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
    assertGridValues(t, startGrid, expectedOutput)
})

test("Grid.shiftRows(-1) shifts downwards", t => {
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
    assertGridValues(t, startGrid, expectedOutput)
})

test("Grid.setRegion() sets value", t => {

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

    assertGridValues(t, startGrid, expectedVal)
})

test("Grid.setRegion() sets null correctly", t => {
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

    assertGridValues(t, startGrid, expectedOuput)
})

test("Grid.cloneRegion() returns new grid for single item", t => {
    const val = [
        [1, 2],
        [3, 4],
    ]

    const startGrid = createGridFromNestedArray(val)

    const topLeftGrid = startGrid.cloneRegion(0, 0, 1, 1)
    t.is(topLeftGrid.width, 1)
    t.is(topLeftGrid.height, 1)
    t.is(topLeftGrid.getCell(0, 0), 1)

    const bottomRightGrid = startGrid.cloneRegion(1, 1, 1, 1)
    t.is(bottomRightGrid.width, 1)
    t.is(bottomRightGrid.height, 1)
    t.is(bottomRightGrid.getCell(0, 0), 4)
})

test("Grid.cloneRegion() returns square subsection", t => {
    const val = [
        [1, 2, 3],
        [3, 4, 5],
        [6, 7, 8],
    ]

    const startGrid = createGridFromNestedArray(val)

    const topLeftGrid = startGrid.cloneRegion(0, 0, 2, 2)
    t.is(topLeftGrid.width, 2)
    t.is(topLeftGrid.height, 2)

    const expectedOutput = [
        [1, 2],
        [3, 4],
    ]

    assertGridValues(t, topLeftGrid, expectedOutput)
})

test("Grid.cloneRegion() handles null & undefined correctly", t => {
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

    assertGridValues(t, outGrid, expectedOutput)
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

function assertGridValues<T>(t: AssertContext, grid: Grid<T>, array: T[][]): void {

    for (let row = 0; row < array.length; row++) {
        const rowItems = array[row]

        for (let col = 0; col < rowItems.length; col++) {
            // var colItem = rowItems[col]

            const item = grid.getCell(col, row)
            t.is(item, array[row][col], `Validate item at row: ${row} and ${col}`)
        }
    }
}
