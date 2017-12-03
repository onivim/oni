/**
 * Test script to verify the scenario where no neovim is installed
 *
 * We should be showing a descriptive error message...
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

const delay = 0

export const test = async (oni: any) => {
    const dir = os.tmpdir()
    const testFileName = `testFile-${new Date().getTime()}.js`
    const tempFilePath = path.join(dir, testFileName)
    oni.automation.sendKeys(":e " + tempFilePath)
    await oni.automation.sleep(50)

    oni.automation.sendKeys("<CR>")

    await oni.automation.sleep(100)
    oni.automation.sendKeys("i")
    await oni.automation.sleep(50)
    oni.automation.sendKeys("const test = ")
    oni.automation.sendKeys("{")
    oni.automation.sendKeys("<enter>")
    oni.automation.sendKeys("window.setTimeout")
    oni.automation.sendKeys("(")
    oni.automation.sendKeys("(")
    oni.automation.sendKeys(")")
    oni.automation.sendKeys(" => ")
    oni.automation.sendKeys("{")
    oni.automation.sendKeys("<enter>")
    // oni.automation.sendKeys("window.setTimeout(() => {<CR>")

    await oni.automation.sleep(50)

    const lines: string[]  = await oni.editors.activeEditor.activeBuffer.getLines(0, 4)

    const expectedResult = [
        "const test = {",
        "   window.setTimeout(() => {",
        "       ",
        "   })",
        "}",
    ]

    assert.deepEqual(lines, expectedResult, "Verify lines are as expected")
}

export const settings = {
    configPath: "AutoClosingPairs.config.js",
}
