/**
 * Tab Bar Sneak Test
 *
 * This test ensures that a user can trigger the sneak functionality and
 * navigate to a different buffer
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import {
    createNewFile,
    getElementByClassName,
    getElementsBySelector,
    getSingleElementBySelector,
    getTemporaryFilePath,
} from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // Next, open a split in the current tab, and check the tab still remains dirty
    oni.automation.sendKeys(":")
    oni.automation.sendKeys("e! buffer1")
    oni.automation.sendKeys("<enter>")
    await oni.automation.sleep(1500)

    oni.automation.sendKeys(":")
    oni.automation.sendKeys("e! buffer2")
    oni.automation.sendKeys("<enter>")
    await oni.automation.sleep(1500)

    await oni.automation.sendKeys("<c-g>")
    await oni.automation.sleep(500)

    const anyOni = oni as any
    const sneak = anyOni.sneak.getSneakMatchingTag("buffer1")
    const keys: string = sneak.triggerKeys.toLowerCase()
    await anyOni.automation.sendKeysV2(keys)
    await oni.automation.sleep(2500)

    const path = oni.editors.activeEditor.activeBuffer.filePath
    assert.ok(path.includes("buffer1"))
}

export const settings = {
    config: {
        "tabs.mode": "buffers",
        "oni.loadInitVim": false,
    },
    allowLogFailures: true,
}
