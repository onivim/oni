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
    await oni.automation.sendKeys("a")
    await oni.automation.sendKeys("e")
    await oni.automation.sleep(1500)

    const buffer1 = getElementByClassName("tab selected")
    assert.ok(buffer1.innerText === "buffer1")
}

export const settings = {
    config: {
        "tabs.mode": "buffers",
    },
    allowLogFailures: true,
}
