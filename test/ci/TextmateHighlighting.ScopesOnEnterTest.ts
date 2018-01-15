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
    await createNewFile("ts", oni, "window")

    // Grab the internal syntax highlight API, and check the token scopes

    const currentBuffer = oni.editors.activeEditor.activeBuffer
    const editorAsAny: any = oni.editors.activeEditor
    const syntaxHighlighter = editorAsAny._syntaxHighlighter

    let tokens = null
    oni.automation.waitFor(() => {
        tokens = syntaxHighlighter.getHighlightTokenAt(currentBuffer.id, types.Position.create(0, 0))
        return tokens && tokens.scopes && tokens.scopes.length > 0
    })

    assert.deepEqual(tokens.scopes, ["source.ts", "support.variable.dom.ts"], "Validate the scopes are correct")
}

export const settings = {
    configPath: "TextmateHighlighting.ScopesOnEnterTest.config.js",
}
