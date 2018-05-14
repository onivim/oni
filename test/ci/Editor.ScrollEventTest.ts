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

const assertValue = (actual: number, expected: number, msg: string, oni: Oni.Plugin.Api) => {
    const passed = actual === expected

    const notification = oni.notifications.createItem()
    const title = passed ? "Assertion Passed" : "Assertion Failed"
    notification.setContents(title, `${msg}\nActual: ${actual}\nExpected:${expected}`)
    ;(notification as any).setLevel(passed ? "success" : "error")
    notification.show()

    assert.strictEqual(actual, expected, msg)
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
    assertValue(scrollEventHitCount, 1, "A single scroll event should've been triggered by G", oni)

    await oni.automation.sendKeys("gg")
    await oni.automation.waitFor(() => scrollEventHitCount === 2)
    assertValue(scrollEventHitCount, 2, "Another scroll event should've been triggered by gg", oni)

    await oni.automation.sendKeys(":50<cr>")
    await oni.automation.waitFor(() => scrollEventHitCount === 3)
    assertValue(
        scrollEventHitCount,
        3,
        "Another scroll event should've been triggered by navigating to a line",
        oni,
    )

    await oni.automation.sendKeys("<c-e>")
    await oni.automation.waitFor(() => scrollEventHitCount === 4)
    assertValue(
        scrollEventHitCount,
        4,
        "Another scroll event should've been triggered by scrolling up one line",
        oni,
    )

    await oni.automation.sendKeys("<c-d>")
    await oni.automation.waitFor(() => scrollEventHitCount === 5)
    assertValue(
        scrollEventHitCount,
        5,
        "Another scroll event should've been triggered by scrolling down one line",
        oni,
    )
}
