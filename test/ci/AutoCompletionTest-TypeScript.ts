/**
 * Test scripts for Auto Complete for a Typescript file.
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import { createNewFile, getCompletionElement } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("ts", oni)

    oni.automation.sendKeys("i")
    await oni.automation.sleep(500)
    oni.automation.sendKeys("window.a")

    // Wait for completion popup to show
    await oni.automation.waitFor(() => getCompletionElement() !== null, 120000)

    // Check for 'alert' as an available completion
    const completionElement = getCompletionElement()
    const textContent = completionElement.textContent

    assert.ok(textContent.indexOf("alert") >= 0, "Verify 'alert' was presented as a completion")
}
