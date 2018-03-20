/**
 * Regression test for #1799
 *
 * Validate that running a large macro operation doesn't crash the editor
 */

import * as assert from "assert"
import * as path from "path"

import * as Oni from "oni-api"
import { getCollateralPath, navigateToFile } from "./Common"

const testCsvFilePath = path.join(getCollateralPath(), "1799_test.csv")

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await navigateToFile(testCsvFilePath, oni)

    const activeEditor = oni.editors.activeEditor

    // Record macro
    await activeEditor.neovim.input("qa")

    // Delete comma from end of line
    await activeEditor.neovim.input("$x")
    await activeEditor.neovim.input("j0")

    // End recording
    await activeEditor.neovim.input("q")

    // Run macro 999 times
    await activeEditor.neovim.input("999@a")

    // Wait for last line to not end with a comma

    let attempts = 0
    let editAccomplished = false
    while (attempts < 5) {
        const [lastLine] = await activeEditor.activeBuffer.getLines(998, 999)

        if (!lastLine.endsWith(",")) {
            editAccomplished = true
            break
        }

        await oni.automation.sleep(1000)
        attempts++
    }

    assert.ok(editAccomplished, "Verify edit applied to last line")

    await activeEditor.neovim.input("G")
    await activeEditor.neovim.input("gg")

    await oni.automation.waitFor(() => activeEditor.activeBuffer.cursor.line === 0)

    await activeEditor.neovim.input("G")

    await oni.automation.waitFor(() => activeEditor.activeBuffer.cursor.line === 999)
}
