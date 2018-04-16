/**
 * Test script to validate themings are properly set for light/dark versions of theme
 */

import * as React from "react"

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

const getBackgroundColor = (oni: Oni.Plugin.Api): string => {
    return oni.colors.getColor("editor.background")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // TODO: Should we expose `request` as an API method?
    const neovimAsAny: any = oni.editors.activeEditor.neovim

    // Set theme to solarized light, validate background color
    oni.configuration.setValues({ "ui.colorscheme": "solarized8_light" })
    await oni.automation.waitFor(() => getBackgroundColor(oni) === "#eee8d5")

    let background: string = await neovimAsAny.request("nvim_get_option", ["background"])
    assert.strictEqual(background, "light")

    // Switch back to dark, validate the color was changed
    oni.configuration.setValues({ "ui.colorscheme": "solarized8_dark" })
    await oni.automation.waitFor(() => getBackgroundColor(oni) === "#073642")

    background = await neovimAsAny.request("nvim_get_option", ["background"])
    assert.strictEqual(background, "dark")

    // Switch back to light
    oni.configuration.setValues({ "ui.colorscheme": "solarized8_light" })
    await oni.automation.waitFor(() => getBackgroundColor(oni) === "#eee8d5")
    background = await neovimAsAny.request("nvim_get_option", ["background"])
    assert.strictEqual(background, "light")

    assert.ok(true, "Color switches were successful!")
}
