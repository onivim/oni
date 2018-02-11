/**
 * Test script to verify the behaviour of the auto closing pair feature.
 *
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

const delay = 0

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni)

    // Wait for the '{' binding to show up, so we get
    // a deterministic result.
    await oni.automation.waitFor(() => oni.input.hasBinding("("))
    await oni.automation.waitFor(() => oni.input.hasBinding(")"))

    oni.automation.sendKeys("i")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")

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
    oni.automation.sendKeys("let testString = ")
    oni.automation.sendKeys('"')
    oni.automation.sendKeys("Oni")
    oni.automation.sendKeys('"')
    oni.automation.sendKeys("<esc>")

    // Because the input is asynchronous, we need to use `waitFor` to wait
    // for them to complete.
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")

    const lines: string[] = await oni.editors.activeEditor.activeBuffer.getLines(0, 5)

    const expectedResult = [
        "const test = {",
        "    window.setTimeout(() => {",
        '        let testString = "Oni"',
        "    })",
        "}",
    ]

    assert.deepEqual(lines, expectedResult, "Verify lines are as expected")
}

// Bring in custom config to include the "" pair, which isn't part of the default config.
export const settings = {
    config: {
        "autoClosingPairs.default": [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
        ],
        "autoClosingPairs.enabled": true,
    },
}
