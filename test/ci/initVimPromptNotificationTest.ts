/**
 * initVimPromptNotification Test
 *
 * Validate that a notification is shown to the user if they have an init.vim
 * but are not using it
 */

import * as assert from "assert"

import * as Oni from "oni-api"
import * as types from "vscode-languageserver-types"

import { createNewFile, getElementsBySelector } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await oni.automation.sleep(1000)
    // Grab the notification element on startup
    const notification = getElementsBySelector("[data-test='notification']")
    const elements = getElementsBySelector("[data-test='notification-title']")

    assert.ok(elements instanceof HTMLCollection)
    if (elements instanceof HTMLCollection) {
        const notificationTitle: Node = elements.item(0)
        const title = notificationTitle.textContent
        assert.strictEqual(title, "init.vim found")
    }

    // Validate that the notification element appears
    assert.ok(!!notification)
}

export const settings = {
    config: {},
}
