/**
 * Test scripts for QuickOpen
 */

export const test = async (oni: any) => {
    await oni.automation.waitForEditors()

    oni.automation.sendKeys(":new<CR>")
    await oni.automation.sleep()

    oni.automation.sendKeys("ihelloworld")

    oni.automation.waitFor(() => {
        const lines = oni.editors.activeEditor.activeBuffer.getLines()
        return lines && lines.length && lines[0] === "helloworld2"
    })
}
