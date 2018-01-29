/**
 * Regression test for #1296
 */

import * as assert from "assert"

import * as Oni from "oni-api"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // Validate that setting the configuration via 'colors' actually sets the color...
    oni.configuration.setValues({
        "colors.foreground": "magenta",
        "colors.editor.foreground": "magenta",
    })

    // Wait for it to be set on the body..
    oni.automation.waitFor(() => {
        const foregroundColor = document.body.style.color
        return foregroundColor === "magenta"
    })
}
