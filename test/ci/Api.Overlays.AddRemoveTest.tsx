/**
 * Test script to verify the scenario where no neovim is installed
 *
 * We should be showing a descriptive error message...
 */

import * as React from "react"

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

const getOverlayElements = () => {
    return document.querySelectorAll(".test-automation-overlay")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni)

    const oniAsAny: any = oni

    const overlays = oniAsAny.overlays

    const overlay = overlays.createItem()
    overlay.setContents(<div className="test-automation-overlay" />)
    overlay.show()

    // Wait for overlay to appear
    await oni.automation.waitFor(() => getOverlayElements().length === 1)

    overlay.hide()

    // Wait for overlay to disappear
    await oni.automation.waitFor(() => getOverlayElements().length === 0)
}
