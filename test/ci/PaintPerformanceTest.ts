/**
 * Test script to valid performance/responsiveness of the typing scenario
 */

import * as assert from "assert"
import * as os from "os"

import { Rectangle, remote } from "electron"

import * as Oni from "oni-api"

import { createNewFile, getCompletionElement } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // Create a file that doesn't have a language associated with it, to minimize noise
    await createNewFile("test_file", oni)

    oni.automation.sendKeys("i")

    // Fire a couple of initial key presses to warm up -
    // there is some expected rendering noise here (like the 'modified' icon in the tab)

    for (let i = 0; i < 5; i++) {
        await oni.automation.sleep(100)
        oni.automation.sendKeys(".")
    }

    const gpuFeatureStatus = remote.app.getGPUFeatureStatus()
    console.log("[PaintPerformance] gpuFeatureStatus: " + JSON.stringify(gpuFeatureStatus)) // tslint:disable-line

    // Unfortunately, if gpu compositing is not enabled, we can't test in as fine grained way
    const gpuCompositingEnabled = gpuFeatureStatus.gpu_compositing === "enabled"

    // There are two metrics we want to measure now:
    // - Number of style elements
    // - Size of paint rectangles

    const startHeadCount = document.head.querySelectorAll("*").length
    const startBodyCount = document.body.querySelectorAll("*").length

    const currentWindow = remote.getCurrentWindow()
    const currentWebContents = currentWindow.webContents

    const paintRectangles: Rectangle[] = []

    currentWebContents.beginFrameSubscription(true, (buffer, dirtyRect) => {
        console.log("[PaintPerformance] dirtyRect: " + JSON.stringify(dirtyRect)) // tslint:disable-line
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

    // TODO: Unfortunately, the `beginFrameSubscription` events don't seem to come through
    // on the OSX TravisCI machine. It would be great to unblock this, but for now,
    // we'll only exercise the paint rectangle validation on Windows:
    if (os.platform() !== "win32") {
        console.warn("Aborting remaining validations because it isn't a Windows machine.") // tslint:disable-line
        return
    }

    assert.ok(paintRectangles.length >= 5, "There should be at least 5 paint rectangles")

    // If gpu compositing is enabled, the browser can take advantage of the cursor and related components
    // being in its own layer, and minimize repaints. Otherwise, it seems that the browser renders in 256 pixel chunks.
    // We'll still test for it, as it can still catch cases where we'd have larger repaint errors.
    const maxHeight = gpuCompositingEnabled ? 20 : 256

    paintRectangles.forEach((pr) => {
        // TODO: #1129 - Validate width as well!

        assert.ok(pr.height <= maxHeight, "Validate rectangle height is less than the max height")
    })
}

// Bring in custom config to turn off animations, in order to reduce noise.
export const settings = {
    configPath: "PaintPerformanceTest.config.js",
}
