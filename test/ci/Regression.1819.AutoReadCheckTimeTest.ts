/**
 * Regression test for #1819
 *
 * Validate our `vim.setting.autoread` behaves as intended
 */

import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { remote } from "electron"

import * as ShellJS from "shelljs"

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

    const windowsAsAny = oni.windows as any
    windowsAsAny.activeSplit.leave()

    await oni.automation.sleep(500)

    writeRevision()
    ShellJS.touch(fileName)

    await oni.automation.sleep(500)

    windowsAsAny.activeSplit.enter()

    const activeEditor = oni.editors.activeEditor

    let attempts = 0
    let editAccomplished = false
    while (attempts < 5) {
        oni.log.info("Attempt: " + attempts)
        const [firstLine] = await activeEditor.activeBuffer.getLines(0, 1)
        oni.log.info("read line: " + firstLine)

        if (firstLine.indexOf("Hello Again") === 0) {
            editAccomplished = true
            break
        }

        await oni.automation.sleep(1000)
        attempts++
    }

    oni.log.info("edit accomplished: " + editAccomplished)
    assert.ok(editAccomplished, "Validate the change was picked up")
}
//
// Bring in custom config.
export const settings = {
    config: {
        "vim.setting.autoread": true,
    },
}
