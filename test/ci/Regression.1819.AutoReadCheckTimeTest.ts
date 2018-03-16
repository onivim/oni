/**
 * Regression test for #1819
 *
 * Validate our `vim.setting.autoread` behaves as intended
 */

import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { remote } from "electron"

import * as Oni from "oni-api"
import { getTemporaryFilePath, navigateToFile } from "./Common"

const fileName = getTemporaryFilePath("txt")
const writeInitialFile = () => {
    fs.writeFileSync(fileName, "Hello World")
}

const writeRevision = () => {
    fs.writeFileSync(fileName, "Hello Again")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    writeInitialFile()

    await navigateToFile(fileName, oni)

    const win = remote.getCurrentWindow()

    win.blur()

    writeRevision()

    await oni.automation.sleep(500)

    win.focus()

    const activeEditor = oni.editors.activeEditor

    let attempts = 0
    let editAccomplished = false
    while (attempts < 5) {
        const [firstLine] = await activeEditor.activeBuffer.getLines(0, 1)

        if (firstLine.indexOf("Hello Again") === 0) {
            editAccomplished = true
            break
        }

        await oni.automation.sleep(1000)
        attempts++
    }

    assert.ok(editAccomplished, "Validate the change was picked up")
}
//
// Bring in custom config.
export const settings = {
    config: {
        "vim.setting.autoread": true,
    },
}
