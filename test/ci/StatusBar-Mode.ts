/**
 * Test scripts for StatusBar
 *
 * Validating the 'mode' UX element showsu p
 */

import * as assert from "assert"
import * as path from "path"

import * as Oni from "oni-api"

import { getElementByClassName } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    // Wait for completion popup to show
    await oni.automation.waitFor(() => getElementByClassName("mode") !== null)

    // Check for 'alert' as an available completion
    const statusBarModeElement = getElementByClassName("mode")
    const textContent = statusBarModeElement.textContent

    assert.ok(
        textContent.indexOf("normal") >= 0,
        "Verify 'normal' was present in the statusbar mode item",
    )
}
