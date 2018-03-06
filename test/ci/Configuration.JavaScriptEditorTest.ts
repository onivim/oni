/**
 * Test script for the JavaScript Configuration Editor
 *
 * In the case where there is a javascript config file, but no
 * corresponding typescript file, the javascript configuration file
 * should be opened.
 */

import * as React from "react"

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile, waitForCommand } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await waitForCommand("oni.config.openUserConfig", oni)
    oni.commands.executeCommand("oni.config.openUserConfig")

    await oni.automation.waitFor(() => {
        return oni.editors.activeEditor.activeBuffer.language === "javascript"
    }, 10000)

    await oni.automation.waitFor(() => {
        return oni.editors.activeEditor.activeBuffer.lineCount > 0
    })

    const bufferLines = await oni.editors.activeEditor.activeBuffer.getLines(0, 100)
    const allLines = bufferLines.join()

    // Validate that the configuration was loaded correctly, and it is the javascript configuration
    assert.ok(allLines.indexOf("someTestConfig") >= 0)
    assert.strictEqual(oni.editors.activeEditor.activeBuffer.language, "javascript")
}

export const settings = {
    config: {
        someTestConfig: 1,
    },
}
