/**
 * WindowManagerTests.ts
 */

import * as assert from "assert"
import {
    checkWindowToFindBest,
    compareDistances,
    DistanceComparison,
    windowIsInValidDirection,
} from "./../src/WindowManager"
import { Rectangle } from "electron"

describe("checkWindowToFindBest", () => {
    it("Correctly accepts better window on X axis.", async () => {
        const currentWindow = { x: 0, y: 0 } as Rectangle
        const testWindow = { x: 100, y: 0 } as Rectangle
        const bestWindow = { x: 150, y: 0 } as Rectangle
        const direction = "right"

        const result = checkWindowToFindBest(currentWindow, testWindow, bestWindow, direction)
        assert.equal(result, true)
    })
    it("Correctly accepts better window on Y axis.", async () => {
        const currentWindow = { x: 0, y: 0 } as Rectangle
        const testWindow = { x: 0, y: 100 } as Rectangle
        const bestWindow = { x: 0, y: 150 } as Rectangle
        const direction = "down"

        const result = checkWindowToFindBest(currentWindow, testWindow, bestWindow, direction)
        assert.equal(result, true)
    })
    it("Correctly rejects worse window on X axis.", async () => {
        const currentWindow = { x: 150, y: 0 } as Rectangle
        const testWindow = { x: 0, y: 0 } as Rectangle
        const bestWindow = { x: 100, y: 0 } as Rectangle
        const direction = "left"

        const result = checkWindowToFindBest(currentWindow, testWindow, bestWindow, direction)
        assert.equal(result, false)
    })
    it("Correctly rejects worse window on Y axis.", async () => {
        const currentWindow = { x: 0, y: 150 } as Rectangle
        const testWindow = { x: 0, y: 50 } as Rectangle
        const bestWindow = { x: 0, y: 100 } as Rectangle
        const direction = "up"

        const result = checkWindowToFindBest(currentWindow, testWindow, bestWindow, direction)
        assert.equal(result, false)
    })
})
describe("compareDistance", () => {
    it("Correctly returns lower.", async () => {
        const currentDiff = 10
        const bestDiff = 100

        const result = compareDistances(currentDiff, bestDiff)
        assert.equal(result, DistanceComparison.smaller)
    })
    it("Correctly returns higher.", async () => {
        const currentDiff = 100
        const bestDiff = 10

        const result = compareDistances(currentDiff, bestDiff)
        assert.equal(result, DistanceComparison.larger)
    })
    it("Correctly returns equal.", async () => {
        const currentDiff = 10
        const bestDiff = 10

        const result = compareDistances(currentDiff, bestDiff)
        assert.equal(result, DistanceComparison.equal)
    })
})
describe("windowIsInValidDirection", () => {
    it("Correctly accepts window in X axis.", async () => {
        const currentWindow = { x: 0, y: 0 } as Rectangle
        const testWindow = { x: 100, y: 0 } as Rectangle
        const direction = "right"

        const result = windowIsInValidDirection(direction, currentWindow, testWindow)
        assert.equal(result, true)
    })
    it("Correctly accepts window in Y axis.", async () => {
        const currentWindow = { x: 0, y: 0 } as Rectangle
        const testWindow = { x: 0, y: 100 } as Rectangle
        const direction = "down"

        const result = windowIsInValidDirection(direction, currentWindow, testWindow)
        assert.equal(result, true)
    })
    it("Correctly rejects window in X axis.", async () => {
        const currentWindow = { x: 50, y: 0 } as Rectangle
        const testWindow = { x: 100, y: 0 } as Rectangle
        const direction = "left"

        const result = windowIsInValidDirection(direction, currentWindow, testWindow)
        assert.equal(result, false)
    })
    it("Correctly rejects window in Y axis.", async () => {
        const currentWindow = { x: 0, y: 50 } as Rectangle
        const testWindow = { x: 0, y: 100 } as Rectangle
        const direction = "up"

        const result = windowIsInValidDirection(direction, currentWindow, testWindow)
        assert.equal(result, false)
    })
})
