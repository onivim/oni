import * as assert from "assert"
import * as Oni from "oni-api"

import { getAllTabs, getElementsBySelector, getTabCloseButtonByIndex } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    const getTabsCount = () => getAllTabs().length
    const waitForTabCount = count => oni.automation.waitFor(() => getTabsCount() === count)

    const openTab = () => {
        const initialTabCount = getTabsCount()
        oni.automation.sendKeys(":tabnew")
        oni.automation.sendKeys("<cr>")
        return waitForTabCount(initialTabCount + 1)
    }

    const closeLastTabWithMouse = () => {
        const tabs = getAllTabs()
        const closeButton = getTabCloseButtonByIndex(tabs.length - 1)
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
