/**
 * initVimPromptNotification Test
 *
 * Validate that a notification is shown to the user if they have an init.vim
 * but are not using it
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import { createNewFile, getElementByClassName, getElementsBySelector } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await oni.automation.waitFor(() => !!getElementByClassName("notification"), 15000)
    // Grab the notification element on startup
    const notification = getElementsBySelector("[data-test='notification']")
    const elements = getElementsBySelector("[data-test='notification-title']")
    console.log("notification ====================: ", notification)
    console.log("elements ===================: ", elements)

    assert.ok(elements instanceof HTMLCollection)
    if (elements instanceof HTMLCollection) {
        const notificationTitle = elements.item(0)
        const title = notificationTitle.textContent
        assert.strictEqual(title, "init.vim found")
    }

    // Validate that the notification element appears
    assert.ok(!!notification)
}

export const settings = {
    config: {
        "oni.loadInitVim": false,
        "notifications.enabled": true,
    },
}
