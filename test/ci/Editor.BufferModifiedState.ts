/**
 * Test script to validate the modified status for buffers.
 */

import * as assert from "assert"
import * as Oni from "oni-api"

import { createNewFile, getElementByTestAttribute, testAttributeSelector } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni)

    // Check the buffer did not have a modified state by default
    const tab = getElementByTestAttribute("tab")
    const modifiedIcon = tab.querySelector(testAttributeSelector("modified-icon"))
    const modifiedIconStyle = getComputedStyle(modifiedIcon)

    assert.strictEqual(modifiedIconStyle.opacity, "0", "Check buffer has no modified icon")

    // Next, edit the buffer and check that shows up
    oni.automation.sendKeys("i")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")

    oni.automation.sendKeys("Buffer has been edited.")
    oni.automation.sendKeys("<esc>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")

    assert.strictEqual(modifiedIconStyle.opacity, "1", "Check buffer now has a modified icon")

    // Finally, swap buffer and swap back to ensure the modified status remains.
    oni.automation.sendKeys(":")
    oni.automation.sendKeys("e buffer2")
    oni.automation.sendKeys("<enter>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.id === "2")

    oni.automation.sendKeys(":")
    oni.automation.sendKeys("buf 1")
    oni.automation.sendKeys("<enter>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.id === "1")

    assert.strictEqual(
        modifiedIconStyle.opacity,
        "1",
        "Check buffer still has modified icon after swapping",
    )
}

// Bring in custom config.
export const settings = {
    config: {
        "tabs.mode": "buffers",
    },
}
