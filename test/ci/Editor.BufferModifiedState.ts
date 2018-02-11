/**
 * Test script to validate the modified status for buffers.
 */

import * as assert from "assert"
import * as Oni from "oni-api"

import { getElementByClassName } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    oni.automation.sendKeys("i")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")

    let tabState = oni.editors.activeEditor.activeBuffer.modified

    assert.ok(!tabState, "Validate current buffer isn't modified")

    oni.automation.sendKeys("Buffer has been edited.")
    oni.automation.sendKeys("<esc>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")

    tabState = oni.editors.activeEditor.activeBuffer.modified

    assert.ok(tabState, "Validate current buffer is modified now")

    oni.automation.sendKeys(":")
    oni.automation.sendKeys("vsplit buffer2")

    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.id === "2")

    oni.automation.sendKeys(":")
    oni.automation.sendKeys("buf 1")

    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.id === "1")

    tabState = oni.editors.activeEditor.activeBuffer.modified

    assert.ok(tabState, "Validate swapping buffer did not lose modified state")
}
