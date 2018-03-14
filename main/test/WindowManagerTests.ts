/**
 * RegExFilterTests.ts
 */

import * as assert from "assert"
import {
    checkWindowToFindBest /*compareDistances, moveToNextOniInstance, windowIsInValidDirection*/,
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
