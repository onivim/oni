/**
 * Test script to verify the scenario where no neovim is installed
 *
 * We should be showing a descriptive error message...
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

const getCompletionElement = () => {

    const elements = document.body.getElementsByClassName("install-help")

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0]
    }
}

export const test = async (oni: any) => {
    // Wait for install help UX to show
    await oni.automation.waitFor(() => getCompletionElement() !== null)

    assert.ok(true, "Found install help content as expected.")
}

export const settings = {
    configPath: "NoInstalledNeovim.config.js",
}
