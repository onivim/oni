/**
 * Test script to verify the scenario where init.vim has an error
 *
 * In that case, a notification should pop up, but the editor should still load.
 */

import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { getTemporaryFilePath } from "./Common"

const createInitVim = (): string => {
    const tempInitVim = getTemporaryFilePath("vim")

    console.log("- Writing init vim to: " + tempInitVim)
    fs.writeFileSync(tempInitVim, "derpInvalidInitVimderp")
    console.log("- Write successful.")

    return tempInitVim
}

const getNotificationElements = () => {
    const elements = document.body.getElementsByClassName("notification")

    if (!elements || !elements.length) {
        return null
    } else {
        return elements
    }
}

export const test = async (oni: Oni.Plugin.Api) => {
    // Wait for install help UX to show
    await oni.automation.waitFor(() => !!getNotificationElements())

    const notificationElements = getNotificationElements()

    assert.strictEqual(notificationElements.length, 1, "Validate there is a single notification")

    const notificationText = notificationElements[0].textContent
    const containsInitVim = notificationText.indexOf("init.vim") >= 0

    assert.ok(containsInitVim, "Validate error notification contains the text 'init.vim'")

    // Validate editors still load
    await oni.automation.waitForEditors()

    assert.ok("Editors loaded successfully.")
}

export const settings = {
    config: {
        "oni.loadInitVim": createInitVim(),
    },
    allowLogFailures: true,
}
