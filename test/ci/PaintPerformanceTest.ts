/**
 * Test script to valid performance/responsiveness of the typing scenario
 */

import * as assert from "assert"

import { remote, Rectangle } from "electron"

import { createNewFile, getCompletionElement } from "./Common"

export const test = async (oni: any) => {
    // Create a file that doesn't have a language associated with it, to minimize noise
    await createNewFile("test_file", oni)

    oni.automation.sendKeys("i")

    // Fire a couple of initial key presses to warm up -
    // there is some expected rendering noise here (like the 'modified' icon in the tab)

    for (let i = 0; i < 5; i++) {
        await oni.automation.sleep(100)
        oni.automation.sendKeys(".")
    }

    // There are two metrics we want to measure now:
    // - Number of style elements
    // - Size of paint rectangles

    const startHeadCount = document.head.querySelectorAll("*").length
    const startBodyCount = document.body.querySelectorAll("*").length

    const currentWindow = remote.getCurrentWindow()
    const currentWebContents = currentWindow.webContents

    const paintRectangles: Rectangle[] = []

    currentWebContents.beginFrameSubscription(true, (buffer, dirtyRect) => {
        console.log("[PaintPerformance] dirtyRect: " + JSON.stringify(dirtyRect))
        paintRectangles.push(dirtyRect)
    })

    // We'll type out another 5 characters...
    for (let i = 0; i < 5; i++) {
        await oni.automation.sleep(100)
        oni.automation.sendKeys(".")
    }

    await oni.automation.sleep(100)

    const endHeadCount = document.head.querySelectorAll("*").length
    const endBodyCount = document.body.querySelectorAll("*").length

    assert.strictEqual(startHeadCount, endHeadCount, "There should be no items added to the head over the course of typing.")
    assert.strictEqual(startBodyCount, endBodyCount, "There should be no items added to the body over the course of typing.")

    assert.ok(paintRectangles.length >= 5, "There should be at least 5 paint rectangles")


    const maxHeight = 50 // Status bar height is 50
    paintRectangles.forEach((pr) => {
        assert.ok(pr.height < maxHeight, "Validate rectangle height is less than the max height")

        // TODO: #1129 - Validate width as well!
    })
}

// Bring in custom config to turn off animations, in order to reduce noise.
export const settings = {
    configPath: "PaintPerformanceTest.config.js",
}
