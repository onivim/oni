/**
 * Test that you can jump to the next/previous error
 */
import * as assert from "assert"
import * as Oni from "oni-api"

import { createNewFile, getTemporaryFilePath, navigateToFile } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    const filePath = createBrokenTypescriptFile()
    await oni.automation.waitForEditors()

    // open file with typescript errors
    navigateToFile(filePath, oni)

    // modify the buffer to trigger error checking
    oni.automation.sendKeys("O")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")
    oni.automation.sendKeys("<esc>")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")

    // wait for 3 errors to be highlighted
    await oni.automation.waitFor(() => {
        // @ts-ignore getErrors() is not exposed in the plugin API
        const errors = oni.diagnostics.getErrors()
        return (
            errors[filePath] &&
            errors[filePath] &&
            errors[filePath]["language-typescript"] &&
            errors[filePath]["language-typescript"].length === 3
        )
    }, 120000)

    // nextError jumps to 1st error
    oni.commands.executeCommand("oni.editor.nextError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 5 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 0,
    )

    // nextError jumps to 2nd error
    oni.commands.executeCommand("oni.editor.nextError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 7 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 7,
    )

    // nextError jumps to 3rd error
    oni.commands.executeCommand("oni.editor.nextError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 9 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 0,
    )

    // nextError jumps back up to 1st error
    oni.commands.executeCommand("oni.editor.nextError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 5 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 0,
    )

    // nextError jumps to 2nd error
    oni.commands.executeCommand("oni.editor.nextError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 7 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 7,
    )

    // previousError jumps to 1st error
    oni.commands.executeCommand("oni.editor.previousError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 5 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 0,
    )

    // previousError jumps back down to 3rd error
    oni.commands.executeCommand("oni.editor.previousError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 9 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 0,
    )

    // previousError jumps to 2nd error
    oni.commands.executeCommand("oni.editor.previousError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 7 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 7,
    )

    // previousError jumps to 1st error
    oni.commands.executeCommand("oni.editor.previousError")
    await oni.automation.waitFor(
        () =>
            oni.editors.activeEditor.activeBuffer.cursor.line === 5 &&
            oni.editors.activeEditor.activeBuffer.cursor.column === 0,
    )
}

import * as fs from "fs"
import * as os from "os"

const createBrokenTypescriptFile = (): string => {
    const filePath = getTemporaryFilePath("ts")
    const content = `
function helloWorld() {
    console.log('Hello World')
}

heloWorld()
helloWorld()
window.nonExistentThing.goodByeWorld()
helloWorld()
helloWrld()
    `.trim()

    fs.writeFileSync(filePath, content)
    return filePath.replace(/\\/g, "/")
}
