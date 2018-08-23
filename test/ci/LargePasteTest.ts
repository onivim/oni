/**
 * Test for pasting a large number of lines
 *
 * Regression test for #2414
 */
import * as assert from "assert"
import * as Oni from "oni-api"

import { createNewFile, getTemporaryFilePath, navigateToFile } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    const filePath = createLargeTestFile()
    await oni.automation.waitForEditors()

    // open file with 2000 lines
    navigateToFile(filePath, oni)

    // select everything
    oni.automation.sendKeys("<s-v>")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "visual")
    oni.automation.sendKeys("G")
    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.cursor.line === 1999)

    // copy and paste should result in 4000 lines
    await copy(oni)
    oni.automation.sendKeys("o")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")
    await paste(oni, () => oni.editors.activeEditor.activeBuffer.lineCount === 4001)
    assert.strictEqual(oni.editors.activeEditor.activeBuffer.lineCount, 4001)

    // go to first line, and copy first word ('this')
    oni.automation.sendKeys("gg")
    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.cursor.line === 0)
    oni.automation.sendKeys("v")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "visual")
    oni.automation.sendKeys("e")
    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.cursor.column === 3)
    await copy(oni)

    // paste in the middle of the first word
    oni.automation.sendKeys("3l")
    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.cursor.column === 3)
    oni.automation.sendKeys("i")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")
    await paste(oni, () => oni.editors.activeEditor.activeBuffer.cursor.column === 7)

    const [firstLine] = await oni.editors.activeEditor.activeBuffer.getLines(0, 1)
    assert.strictEqual(
        firstLine,
        "thithiss is a line of 'text' that will be repeated a bunch of times to make for a large wall of 'text' to paste",
    )
}

import * as fs from "fs"
import * as os from "os"

const createLargeTestFile = (): string => {
    const filePath = getTemporaryFilePath("js")
    const line =
        "this is a line of 'text' that will be repeated a bunch of times to make for a large wall of 'text' to paste"

    const lines = []
    for (let i = 0; i < 2000; i++) {
        lines.push(line)
    }

    fs.writeFileSync(filePath, lines.join(os.EOL))
    return filePath
}

import { isMac } from "../../browser/src/Platform"

const copy = async (oni: Oni.Plugin.Api) => {
    if (isMac()) {
        oni.automation.sendKeys("<m-c>")
    } else {
        oni.automation.sendKeys("<c-c>")
    }

    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")
}

const paste = async (
    oni: Oni.Plugin.Api,
    waitConditionChecker: Oni.Automation.WaitConditionChecker,
) => {
    if (isMac()) {
        oni.automation.sendKeys("<m-v>")
    } else {
        oni.automation.sendKeys("<c-v>")
    }

    await oni.automation.waitFor(waitConditionChecker)

    oni.automation.sendKeys("<esc>")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")
}
