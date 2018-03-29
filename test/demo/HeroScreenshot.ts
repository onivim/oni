/**
 * Script for hero screenshot on Oni's website and github
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { remote } from "electron"

import { getDistPath, getRootPath } from "./DemoCommon"

// tslint:disable:no-console

const getCompletionElement = () => document.body.querySelector(`[data-test="autocompletion"]`)

export const test = async (oni: any) => {
    await oni.automation.waitForEditors()

    let lastAlertText = null
    window.alert = myText => (lastAlertText = myText)

    // Use the `Completion.ts` file as the screenshot source
    remote.getCurrentWindow().setSize(1200, 800)

    const outputPath = getDistPath()

    await oni.workspace.changeDirectory(getRootPath())

    const filePath = path.join(
        getRootPath(),
        "browser",
        "src",
        "Services",
        "Language",
        "LanguageStore.ts",
    )

    oni.automation.sendKeys(":e WELCOME.md<CR>")

    await oni.automation.sleep(500)

    oni.automation.sendKeys(":e " + filePath + "<CR>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.filePath === filePath)

    oni.automation.sendKeys("/switchMap<CR>")

    await oni.automation.sleep(500)

    oni.automation.sendKeys("<ESC>zz")

    await oni.automation.sleep(500)

    oni.automation.sendKeys("O")
    oni.automation.sendKeys("<TAB><TAB>.audi")

    await oni.automation.sleep(500)

    oni.automation.sendKeys("tTime((action")

    await oni.automation.sleep(500)

    await oni.automation.waitFor(() => getCompletionElement() !== null, 20000)

    await oni.automation.sleep(500)

    oni.configuration.setValues({ "recorder.outputPath": outputPath })

    oni.recorder.takeScreenshot(`screenshot-${process.platform}.png`)

    await oni.automation.waitFor(() => lastAlertText !== null, 20000)
    console.log("Alert text (screenshot output path): " + lastAlertText)
}

export const settings = {
    config: {
        "notifications.enabled": false,
    },
}
