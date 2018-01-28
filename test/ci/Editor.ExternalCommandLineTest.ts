/**
 * Test script to validate the external command line
 */

import * as assert from "assert"
import * as Oni from "oni-api"

import { getElementByClassName } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    oni.automation.sendKeys(":")

    await oni.automation.waitFor(() => !!getElementByClassName("command-line"))

    assert.ok(!!getElementByClassName("command-line"), "Validate command line UI is shown")
}

// Bring in custom config to turn off animations, in order to reduce noise.
export const settings = {
    configPath: "Editor.ExternalCommandLine.config.js",
}
