import * as assert from "assert"
import * as Oni from "oni-api"

import { getElementsBySelector } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    const getTabsCount = () => getElementsBySelector(".tabs .tab").length
    const waitForTabCount = count => oni.automation.waitFor(() => getTabsCount() === count)

    const openTab = () => {
        const initialTabCount = getTabsCount()
        oni.automation.sendKeys(":tabnew")
        oni.automation.sendKeys("<cr>")
        return waitForTabCount(initialTabCount + 1)
    }

    const closeLastTabWithMouse = () => {
        const tabs = getElementsBySelector(".tabs .tab")
        const closeButton = tabs[tabs.length - 1].querySelector(".corner.enable-hover")
        closeButton.click()
        return waitForTabCount(tabs.length - 1)
    }

    await oni.automation.waitForEditors()

    // 1. Create two tabs, then close the last on
    await openTab()
    await openTab()
    await closeLastTabWithMouse()

    // 3. Open another tab
    await openTab()

    // 4.1 Attempt to close it
    await closeLastTabWithMouse()
}

// Bring in custom config.
export const settings = {
    config: {
        "tabs.mode": "tabs",
    },
}
