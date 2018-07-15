import * as assert from "assert"
import * as Oni from "oni-api"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    oni.automation.sendKeys("i")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")

    oni.automation.sendKeys("ß")
    oni.automation.sendKeys("<Esc>")

    // Because the input is asynchronous, we need to use `waitFor` to wait
    // for them to complete.
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")
    await assertPosition(oni, 0, "normal")

    oni.automation.sendKeys("i")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")
    await assertPosition(oni, 0, "insert before")

    oni.automation.sendKeys("<Esc>")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")

    oni.automation.sendKeys("a")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")
    await assertPosition(oni, 1, "insert after")

    oni.automation.sendKeys("ß")
    oni.automation.sendKeys("<Esc>")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")
    await assertPosition(oni, 1, "second normal")

    oni.automation.sendKeys("a")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")
    await assertPosition(oni, 2, "second insert after")
}

async function assertPosition(
    oni: Oni.Plugin.Api,
    column: number,
    position: string,
): Promise<void> {
    const cursor = oni.editors.activeEditor.activeBuffer.cursor
    const cursorPosition = await oni.editors.activeEditor.activeBuffer.getCursorPosition()

    assert.equal(cursor.column, column, position + " c " + cursor.column + " " + column)
    assert.equal(
        cursorPosition.character,
        column,
        position + " p " + cursorPosition.character + " " + column,
    )
}
