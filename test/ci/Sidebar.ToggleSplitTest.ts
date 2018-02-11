/**
 * Test script to validate sidebar split toggle behavior
 */

import * as assert from "assert"

import * as Oni from "oni-api"

const getSidebarSplit = () => {
    return document.querySelectorAll(".sidebar-content")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // Wait for sidebar split to appear
    await oni.automation.waitFor(() => getSidebarSplit().length === 1)

    // Validate sidebar is hidden
    oni.commands.executeCommand("sidebar.toggle")
    await oni.automation.waitFor(() => getSidebarSplit().length === 0)
    assert.ok(true, "Sidebar was hidden.")

    // Validate sidebar comes back
    oni.commands.executeCommand("sidebar.toggle")
    await oni.automation.waitFor(() => getSidebarSplit().length === 1)

    assert.ok(true, "Sidebar came back.")
}
