/**
 * Test script for the Color highlight Layer.
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"
import { createNewFile } from "./Common"

const testStr = `
    .test {
        background-color: blue;
        color: red;
    }
`

const getColorHighlights = () => document.querySelectorAll("[data-id='color-highlight']")

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("css", oni, testStr)

    const elements = getColorHighlights()

    assert.ok(elements.length === 2, "Validate a color highlight is present in the layer")

    // Render the same test string in an incompatible buffer and plugin should not render
    await createNewFile("md", oni, testStr)
    const markdownIndents = getColorHighlights()

    assert.ok(markdownIndents.length === 0, "No highlights are rendered in an incompatible file")
}

export const settings = {
    config: {
        "oni.useDefaultConfig": true,
        "oni.loadInitVim": false,
        "experimental.colorHighlight.enabled": true,
        "experimental.colorHighlight.filetypes": [".tsx", ".ts", ".jsx", ".js", ".css"],
        "_internal.hasCheckedInitVim": true,
    },
}
