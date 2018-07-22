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
    oni.automation.sendKeys("<enter>")

    await oni.automation.waitFor(() => oni.menu.isMenuOpen())
    assert(oni.menu.isMenuOpen(), "Check menu opened correctly.")

    oni.commands.executeCommand("menu.close")

    // Now test passing optional arguments
    // Create a test command to call, but could be swapped to use the browser
    // when more easily accessible.
    oni.commands.registerCommand({
        command: "ciTest.test",
        name: "Test passing over args.",
        detail: "Opens a file.",
        execute: (file?: string) => oni.editors.activeEditor.neovim.command(`:e ${file}`),
    })
    await oni.automation.sleep(500)

    oni.automation.sendKeys(":")
    await oni.automation.waitFor(() => !!getElementByClassName("command-line"))
    oni.automation.sendKeys('call OniCommand("ciTest.test", "testFile")')
    oni.automation.sendKeys("<enter>")

    await oni.automation.waitFor(() =>
        oni.editors.activeEditor.activeBuffer.filePath.endsWith("testFile"),
    )

    const currentBuffer = oni.editors.activeEditor.activeBuffer.filePath

    assert(
        currentBuffer.endsWith("testFile"),
        "Check file opened correctly after being passed over.",
    )

    // Finally test passing multiple optional arguments
    oni.commands.registerCommand({
        command: "ciTest.test2",
        name: "Test passing over args.",
        detail: "Opens multiple files.",
        execute: (files?: string[]) => {
            files.forEach(file => oni.editors.activeEditor.neovim.command(`:e ${file}`))
        },
    })
    await oni.automation.sleep(500)

    oni.automation.sendKeys(":")
    await oni.automation.waitFor(() => !!getElementByClassName("command-line"))
    oni.automation.sendKeys(
        'call OniCommand("ciTest.test2", "testFile2", "testFile3", "testFile4")',
    )
    oni.automation.sendKeys("<enter>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.id === "4")

    const currentBufferId = oni.editors.activeEditor.activeBuffer.id

    assert(
        currentBufferId === "4",
        "Check multiple files opened correctly after being passed over.",
    )
}
