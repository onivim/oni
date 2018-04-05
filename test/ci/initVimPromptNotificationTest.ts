/**
 * initVimPromptNotification Test
 *
 * Validate that a notification is shown to the user if they have an init.vim
 * but are not using it
 */

// import * as assert from "assert"
import { Assertor } from "./Assert"

import * as Oni from "oni-api"

import {
    createNewFile,
    getElementByClassName,
    getElementsBySelector,
    getSingleElementBySelector,
} from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    const assert = new Assertor("Prompt Notification Test ===============")
    await oni.automation.waitForEditors()

    await oni.automation.sleep(1500)
    // Grab the notification element on startup
    const notification = getSingleElementBySelector("[data-test='notification']")
    const notificationTitle = getSingleElementBySelector("[data-test='notification-title']")

    // Validate that the notification element appears
    assert.defined(notification, "Notification component exitsts")
    assert.defined(notificationTitle, "Notification title exitsts")

    assert.assert(
        notificationTitle.textContent.includes("init.vim"),
        "Correct notification surfaces",
    )
    ;(notification as HTMLElement).click()

    await oni.automation.sleep(2500)

    const isNotification = Boolean(getSingleElementBySelector("[data-test='notification']"))
    assert.assert(!isNotification, "The notification disappears")

    const useInitVim = oni.configuration.getValue("oni.loadInitVim")
    assert.assert(!useInitVim, "Init vim is disabled")
}

export const settings = {
    config: {
        "oni.loadInitVim": false,
        "oni.useDefaultConfig": true,
        "notifications.enabled": true,
        "_internal.hasCheckedInitVim": false,
    },
}
