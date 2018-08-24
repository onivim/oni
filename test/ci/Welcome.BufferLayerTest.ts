/**
 * Test script for the Welcome Screen Buffer Layer.
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

const getWelcomeElement = () => document.querySelectorAll("[data-id='welcome-screen']")

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()
    await oni.automation.sleep(1000)

    const element = getWelcomeElement()

    assert.ok(element[0], "Validate the welcome screen is present")
}

export const settings = {
    config: {
        "oni.useDefaultConfig": true,
        "oni.loadInitVim": false,
        "experimental.welcome.enabled": true,
        "_internal.hasCheckedInitVim": true,
    },
}
