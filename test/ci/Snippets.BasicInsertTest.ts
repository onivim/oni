/**
 * Simple snippet insert test case - validate the buffer is set, and that the cursor position is correct.
 * This is a very simple case w/o placeholders
 */

import * as assert from "assert"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("ts", oni)

    await oni.snippets.insertSnippet("foo")

    const [firstLine] = await oni.editors.activeEditor.activeBuffer.getLines(0, 1)

    assert.strictEqual(firstLine, "foo", "Validate line is set correctly")

    // TODO: getCursorPosition should be added to API
    const cursorPosition = await (oni.editors.activeEditor.activeBuffer as any).getCursorPosition()

    assert.deepEqual(cursorPosition, { line: 0, character: 3 }, "Validate cursor is at end of line")
}
