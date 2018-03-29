/**
 * Test script to validate calling Oni commands from Neovim
 */

import * as assert from "assert"
import * as Oni from "oni-api"

import { getElementByClassName } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // Open the commandline and open the QuickOpen Menu.
    oni.automation.sendKeys(":")
    await oni.automation.waitFor(() => !!getElementByClassName("command-line"))
    oni.automation.sendKeys('call OniCommand("quickOpen.show")')

    await oni.automation.waitFor(() => oni.menu.isMenuOpen())
    assert(oni.menu.isMenuOpen(), "Check menu opened correctly.")

    // Now test passing optional arguments
    // Create a test command to call, but could be swapped to use the browser
    // when more easily accessible.

    oni.commands.registerCommand({
        command: "ciTest.test",
        name: "Test passing over args.",
        detail: "Opens a file.",
        execute: (file?: string) => oni.editors.activeEditor.openFile(file),
    })

    await oni.automation.sleep(500)
    oni.automation.sendKeys(":")
    await oni.automation.waitFor(() => !!getElementByClassName("command-line"))
    oni.automation.sendKeys('call OniCommand("ciTest.test", "testFile.tsx")')

    await oni.automation.waitFor(() =>
        oni.editors.activeEditor.activeBuffer.filePath.endsWith("testFile.tsx"),
    )
    assert(oni.menu.isMenuOpen(), "Check file opened correctly after being passed over.")

    await oni.automation.sleep(500)
}
