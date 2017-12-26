/**
 * Test script to verify the scenario where no neovim is installed
 *
 * We should be showing a descriptive error message...
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { createNewFile } from "./Common"

const delay = 0

export const test = async (oni: any) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni)

    // Wait for the '{' binding to show up, so we get
    // a deterministic result.
    await oni.automation.waitFor(() => oni.input.hasBinding("{"))

    await oni.automation.sendKeys("i")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert", 1000)

    await oni.automation.sendKeys("const test = ")
    await oni.automation.sendKeys("{")
    await oni.automation.sendKeys("<enter>")
    await oni.automation.sendKeys("window.setTimeout")
    await oni.automation.sendKeys("(")
    await oni.automation.sendKeys("(")
    await oni.automation.sendKeys(")")
    await oni.automation.sendKeys(" => ")
    await oni.automation.sendKeys("{")
    await oni.automation.sendKeys("<enter>")
    console.log('Entered input') // tslint:disable-line
    // Because the input is asynchronous, we need to use `waitFor` to wait
    // for them to complete.
    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.lineCount === 5)

    const lines: string[]  = await oni.editors.activeEditor.activeBuffer.getLines(0, 5)

    const expectedResult = [
        "const test = {",
        "    window.setTimeout(() => {",
        "        ",
        "    })",
        "}",
    ]

    assert.deepEqual(lines, expectedResult, "Verify lines are as expected")
}
