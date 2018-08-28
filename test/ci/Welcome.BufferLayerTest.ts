/**
 * Test script for the Welcome Screen Buffer Layer.
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"
import { getSingleElementBySelector } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()
    await oni.automation.sleep(2000)

    const element = getSingleElementBySelector("[data-id='welcome-screen']")

    assert.ok(!!element, "Validate the welcome screen is present")

    assert.ok(
        oni.editors.activeEditor.activeBuffer.filePath.includes("WELCOME"),
        "Validate that the current buffer is the Welcome one",
    )
    oni.automation.sendKeys("<enter>")
    assert.ok(
        !!oni.editors.activeEditor.activeBuffer.filePath,
        "Validate it opens empty unnamed new file",
    )
}

export const settings = {
    config: {
        "oni.useDefaultConfig": true,
        "oni.loadInitVim": false,
        "experimental.welcome.enabled": true,
        "_internal.hasCheckedInitVim": true,
    },
}
