/**
 * Test for pasting a large number of lines
 *
 * Regression test for #2414
 */
import * as Oni from "oni-api"

import { createNewFile, getTemporaryFilePath, navigateToFile } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    const filePath = createLargeTestFile()
    await oni.automation.waitForEditors()

    navigateToFile(filePath, oni)

    await oni.automation.sendKeys("<s-v>")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "visual", 30000)

    await oni.automation.sendKeys("G")
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.cursor.line === 1999,
        30000,
    )

    await copy(oni)
    await paste(oni)

    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.lineCount === 4001,
        30000,
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
        await oni.automation.sendKeys("<m-c>")
    } else {
        await oni.automation.sendKeys("<c-c>")
    }

    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal", 30000)
}

const paste = async (oni: Oni.Plugin.Api) => {
    await oni.automation.sendKeys("o")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert", 30000)

    if (isMac()) {
        await oni.automation.sendKeys("<m-v>")
    } else {
        await oni.automation.sendKeys("<c-v>")
    }
}
