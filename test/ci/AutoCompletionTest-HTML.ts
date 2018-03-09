/**
 * Test scripts for Auto Complete for a HTML file.
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import { createNewFile, getCompletionElement } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("html", oni)

    oni.automation.sendKeys("i")
    await oni.automation.sleep(500)
    oni.automation.sendKeys("<lt>body s")

    // Wait for completion popup to show
    await oni.automation.waitFor(() => getCompletionElement() !== null)

    // Check for 'alert' as an available completion
    const completionElement = getCompletionElement()
    const textContent = completionElement.textContent

    assert.ok(textContent.indexOf("style") >= 0, "Verify 'style' was presented as a completion")
}
