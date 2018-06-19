/**
 * Test scripts for Auto Complete for a Typescript file.
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import { WebviewTag } from "electron"

import { getElementsBySelector } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    const getWebView = (): WebviewTag | null => {
        const elems = getElementsBySelector("webview")
        return elems.length > 0 ? elems[0] : null
    }

    const waitForWebViewUrl = (urlPart: string): boolean => {
        const webview = getWebView()

        if (!webview) {
            return false
        }

        const url = webview.getURL()

        return url.indexOf(urlPart) >= 0
    }

    oni.commands.executeCommand("browser.openUrl.verticalSplit", "https://github.com/onivim/oni")

    await oni.automation.waitFor(() => getWebView() !== null)
    await oni.automation.waitFor(() => waitForWebViewUrl("github.com"))

    await oni.automation.sendKeys("<c-g>")
    await oni.automation.sleep(500)

    // We'll sneak to the browser address and load a new site
    const anyOni = oni as any
    const sneak = anyOni.sneak.getSneakMatchingTag("browser.address")

    const keys: string = sneak.triggerKeys.toLowerCase()
    await anyOni.automation.sendKeysV2(keys)

    await oni.automation.sleep(500)

    await anyOni.automation.sendKeysV2("https://www.onivim.io")

    await oni.automation.sleep(500)

    await anyOni.automation.sendKeysV2("<CR>")

    await oni.automation.waitFor(() => waitForWebViewUrl("onivim.io"))

    assert.ok(
        getWebView()
            .getURL()
            .indexOf("onivim.io") >= 0,
        "Successfully navigated to onivim.io",
    )
}
