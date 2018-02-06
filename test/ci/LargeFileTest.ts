/**
 * Test for opening a large file
 *
 * Regression test for #1064
 */

import * as Oni from "oni-api"

import { getTemporaryFilePath, navigateToFile } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    const filePath = createLargeTestFile()
    await oni.automation.waitForEditors()

    navigateToFile(filePath, oni)

    oni.automation.sendKeys("G")
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.cursor.line === 99999,
        30000,
    )

    oni.automation.sendKeys(":50000<CR>")
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.cursor.line === 49999,
        30000,
    )

    oni.automation.sendKeys("gg")
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.cursor.line === 0,
        30000,
    )
}

import * as fs from "fs"
import * as os from "os"

const createLargeTestFile = (): string => {
    const filePath = getTemporaryFilePath("js")
    const line =
        "window.alert('hello world from a very very very very extremely large javascript file'); // testing testing testing to make the line very long"

    const lineCount = 100 * 1000

    const lines = []
    for (let i = 0; i < lineCount; i++) {
        lines.push(line + os.EOL)
    }

    fs.writeFileSync(filePath, lines)
    return filePath
}
