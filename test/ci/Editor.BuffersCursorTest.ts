/*
 * Test Cursor functionality of oni buffers
 *
 */
import * as assert from "assert"
import * as Oni from "oni-api"

import { createNewFile, getTemporaryFilePath, insertText, navigateToFile } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    createNewFile("ts", oni)
    await insertText(oni, "console.log('apple')")

    const activeBuffer: any = oni.editors.activeEditor.activeBuffer

    const { cursorOffset } = activeBuffer

    assert.equal(cursorOffset, 20)

    // Test that a cursor offset is correctly converted to a line and character
    // results are 0 based
    const { line, character } = await activeBuffer.convertOffsetToLineColumn(cursorOffset)

    assert.equal(line + 1, 1)
    assert.equal(character, 19)
    // Check that the cursor position from the conversion matches the getCursorPosition method
    // results
    const {
        line: currentLine,
        character: currentCharacter,
    } = await activeBuffer.getCursorPosition()

    assert.strictEqual(line, currentLine)
    assert.strictEqual(currentCharacter, character)
}
