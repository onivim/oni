/**
 * TextmateHighlighting.DebugScopesTest
 *
 * Validate the 'editor.textMateHighlighting.debugScopes' functionality
 */

import * as assert from "assert"

import * as Oni from "oni-api"
import * as types from "vscode-languageserver-types"

import { createNewFile, getElementByClassName } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // Create typescript file with just "window" as teh contents
    await createNewFile("ts", oni, "const test = 1;")

    // Grab the internal syntax highlight API, and check the token scopes
    const currentBuffer = oni.editors.activeEditor.activeBuffer
    const editorAsAny: any = oni.editors.activeEditor
    const syntaxHighlighter = editorAsAny.syntaxHighlighter

    let tokens = null
    await oni.automation.waitFor(() => {
        tokens = syntaxHighlighter.getHighlightTokenAt(
            currentBuffer.id,
            types.Position.create(0, 0),
        )
        return tokens && tokens.scopes && tokens.scopes.length > 0
    }, 120000)

    oni.automation.sendKeys("w")

    let element: HTMLElement = null
    await oni.automation.waitFor(() => {
        element = getElementByClassName("quick-info-debug-scopes")
        return !!element
    }, 120000)

    await oni.automation.waitFor(() => {
        const items = element.getElementsByTagName("li")
        return items.length > 0
    })

    assert.ok(
        element.textContent.indexOf("DEBUG: TextMate Scopes") >= 0,
        "Validate debug scopes showed up",
    )
}

export const settings = {
    config: {
        "editor.textMateHighlighting.debugScopes": true,
    },
}
