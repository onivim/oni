/**
 * Regression test for #2047
 */

import * as assert from "assert"

import * as Oni from "oni-api"

const isInteger = (num: number) => {
    return Math.round(num) === num
}

const assertCanvasIsIntegerSize = (canvasElement: HTMLElement) => {
    const rect = canvasElement.getBoundingClientRect()
    const measuredWidth = rect.width
    const measuredHeight = rect.height

    assert.ok(isInteger(measuredWidth), "Validate the canvas's width is an integer value")
    assert.ok(isInteger(measuredHeight), "Validate the canvas's height is an integer value")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    const allCanvasElements = document.getElementsByTagName("canvas")

    assert.ok(allCanvasElements.length > 0, "Verify there is at least one canvas element")

    for (let i = 0; i < allCanvasElements.length; i++) {
        assertCanvasIsIntegerSize(allCanvasElements[i])
    }
}
