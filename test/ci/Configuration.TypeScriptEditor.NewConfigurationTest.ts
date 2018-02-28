/**
 * Test script for the TypeScript Configuration Editor
 *
 * In the case where there is no configuration file, a configuration file
 * should be created, and there should be intellisense available for the API
 * surface, and saving should update the configuration file.
 * corresponding typescript file, the javascript configuration file
 * should be opened.
 */

import * as React from "react"

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile, getTemporaryFolder } from "./Common"

const emptyConfigPath = path.join(getTemporaryFolder(), "config.js")

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    oni.commands.executeCommand("oni.config.openUserConfig")

    await oni.automation.waitFor(() => {
        return oni.editors.activeEditor.activeBuffer.language === "typescript"
    }, 10000)

    await oni.automation.waitFor(() => {
        return oni.editors.activeEditor.activeBuffer.lineCount > 0
    })

    const bufferLines = await oni.editors.activeEditor.activeBuffer.getLines(0, 100)
    const allLines = bufferLines.join()

    // Validate that the configuration was loaded correctly, and it is the javascript configuration
    assert.ok(allLines.indexOf("oni-api") >= 0, "Validate oni-api line is present")
    assert.ok(allLines.indexOf("activate") >= 0, "Validate activate method is present")
    assert.strictEqual(oni.editors.activeEditor.activeBuffer.language, "typescript")
}

export const settings = {
    configPath: emptyConfigPath,
}
