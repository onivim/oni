/**
 * Regression test for #1295
 *
 * Validate that creating a window without focus doesn't crash the app!
 */

import * as assert from "assert"

import * as Oni from "oni-api"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // We'll execute two commands in quick succession:
    // :vsp
    // :wincmd p
    // This creates a new vertical split, and immediately moves back to the previous window

    const neovim = oni.editors.activeEditor.neovim

    const p1 = neovim.command(":vsp")
    const p2 = neovim.command(":wincmd p")

    await Promise.all([p1, p1])

    // Not sure of a deterministic way to wait for this, but we need
    // to wait for a redraw to come back from the editor
    await oni.automation.sleep(1000)

    const editorElements = document.getElementsByClassName("editor")
    assert.ok(editorElements.length > 0, "Validate an editor is still present")
}
