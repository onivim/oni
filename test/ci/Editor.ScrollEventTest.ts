/**
 * Test script to validate the modified status for tabs.
 */

import * as assert from "assert"
import * as Oni from "oni-api"

import { createNewFile, getElementByClassName } from "./Common"

import * as os from "os"
const createLines = (num: number): string => {
    const ret = []

    for (let i = 0; i < num; i++) {
        ret.push(i)
    }

    return ret.join(os.EOL)
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni, createLines(500))

    let scrollEventHitCount = 0

    oni.editors.activeEditor.onBufferScrolled.subscribe(() => {
        scrollEventHitCount++
    })

    await oni.automation.sendKeys("G")

    await oni.automation.waitFor(() => scrollEventHitCount === 1)
    assert.strictEqual(scrollEventHitCount, 1, "A single scroll event should've been triggered")

    await oni.automation.sendKeys("gg")
    await oni.automation.waitFor(() => scrollEventHitCount === 2)
    assert.strictEqual(scrollEventHitCount, 2, "Another scroll event should've been triggered")

    await oni.automation.sendKeys(":50<cr>")
    await oni.automation.waitFor(() => scrollEventHitCount === 3)
    assert.strictEqual(scrollEventHitCount, 3, "Another scroll event should've been triggered")

    await oni.automation.sendKeys("<c-e>")
    await oni.automation.waitFor(() => scrollEventHitCount === 4)
    assert.strictEqual(scrollEventHitCount, 4, "Another scroll event should've been triggered")

    await oni.automation.sendKeys("<c-d>")
    await oni.automation.waitFor(() => scrollEventHitCount === 5)
    assert.strictEqual(scrollEventHitCount, 5, "Another scroll event should've been triggered")
}
