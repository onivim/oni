/**
 * TextmateHighlighting.ScopesOnEnterTest
 *
 * Validate that syntax tokens for text mate highlighting are available on etner
 */

import * as assert from "assert"

import * as Oni from "oni-api"
import * as types from "vscode-languageserver-types"

import { createNewFile, getCompletionElement } from "./Common"

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
            types.Position.create(0, 8),
        )
        return tokens && tokens.scopes && tokens.scopes.length > 0
    }, 10000)

    // Use an internal API to get the screen cell, and validate it is colored correctly

    // Note that the position has to include the line numbers
    const cell = editorAsAny._neovimEditor._screen.getCell(11 /*x, include line number */, 0)

    // Validate the token color is correct
    assert.strictEqual(cell.foregroundColor, "#00ff00")
}

export const settings = {
    config: {
        "editor.tokenColors": [
            {
                scope: "variable.other",
                settings: {
                    foregroundColor: "#00FF00",
                },
            },
        ],
    },
}
