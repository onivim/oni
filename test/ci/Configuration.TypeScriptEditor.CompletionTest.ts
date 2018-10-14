/**
 * Test script for the TypeScript Configuration Editor
 *
 * Validate that appropriate typings are coming in -
 * in particular, we should be getting typing info
 * for the `oni-api` surface.
 */

import * as React from "react"

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile, getCompletionElement, getTemporaryFolder, waitForCommand } from "./Common"

const emptyConfigPath = path.join(getTemporaryFolder(), "config.js")

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await waitForCommand("oni.config.openUserConfig", oni)
    oni.commands.executeCommand("oni.config.openUserConfig")

    await oni.automation.waitFor(() => {
        return oni.editors.activeEditor.activeBuffer.language === "typescript"
    }, 10000)

    await oni.automation.waitFor(() => {
        return oni.editors.activeEditor.activeBuffer.lineCount > 0
    })

    // Put cursor after 'activate' line
    oni.automation.sendKeys(":7")
    oni.automation.sendKeys("<cr>")
    oni.automation.sendKeys("i")

    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")

    oni.automation.sendKeys("oni.a")

    const hasCompletionElement = () =>
        getCompletionElement() && getCompletionElement().textContent.indexOf("automation") >= 0

    await oni.automation.waitFor(hasCompletionElement, 120000)

    assert.ok(hasCompletionElement(), "Got completion element!")
}

export const settings = {
    configPath: emptyConfigPath,
}
