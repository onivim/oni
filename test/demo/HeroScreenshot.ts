/**
 * Script for hero screenshot on Oni's website and github
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { remote } from "electron"

import { getDistPath, getRootPath } from "./DemoCommon"

const getCompletionElement = () => {

    const elements = document.body.getElementsByClassName("autocompletion")

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0]
    }
}

export const test = async (oni: any) => {

    let lastAlertText = null
    window.alert = (myText) => lastAlertText = myText

    // Use the `Completion.ts` file as the screenshot source
    remote.getCurrentWindow().setSize(800, 600)

    const outputPath = getDistPath()

    oni.configuration.setValues({"recorder.outputPath": outputPath})

    const filePath = path.join(getRootPath(), "browser", "src", "Services", "Language", "Completion", "Completion.ts")

    oni.automation.sendKeys(":e test.py<CR>")

    await oni.automation.sleep(500)

    oni.automation.sendKeys(":e " + filePath + "<CR>")

    await oni.automation.sleep(500)

    oni.automation.sendKeys("/distinctUntil<CR>")

    await oni.automation.sleep(500)

    oni.automation.sendKeys("<ESC>zz")

    await oni.automation.sleep(500)

    oni.automation.sendKeys("o")
    oni.automation.sendKeys(".m")

    await oni.automation.sleep(500)

    oni.automation.sendKeys("er")

    await oni.automation.waitFor(() => getCompletionElement() !== null)

    await oni.automation.sleep(500)

    oni.recorder.takeScreenshot("demo-screenshot.png")

    await oni.automation.waitFor(() => lastAlertText !== null)
}
