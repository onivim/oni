/**
 * Test script for the Indent Lines Layer.
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

const getLayerElements = () => {
    return document.querySelectorAll("[data-test='indent-line']")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile(
        "js",
        oni,
        "function indentTest(){\n  console.log('test')\n  const a = 5\n}",
    )

    // Wait for layer to appear
    await oni.automation.waitFor(() => getLayerElements().length === 1, 5000)

    const element = getLayerElements()[0]
    assert.ok(element, "Validate an indent line is present in the layer")

    // Validate elements
    // assert.strictEqual(getActiveLayerElements().length, 1)
    // assert.strictEqual(getInactiveLayerElements().length, 0)
}

export const settings = {
    config: {
        "oni.useDefaultConfig": true,
        "oni.loadInitVim": false,
        "experimental.indentLines.enabled": true,
        "_internal.hasCheckedInitVim": true,
    },
}
