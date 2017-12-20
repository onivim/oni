/**
 * Test scripts for QuickOpen
 */

export const test = async (oni: any) => {
    oni.automation.sendKeys(":new test.txt<CR>")

    await oni.automation.sleep(3000)

    oni.automation.sendKeys("ihelloworld2")

    await oni.automation.waitFor(() => {
        const lines = oni.editors.activeEditor.activeBuffer.getLines()
        return lines && lines.length && lines[0] === "helloworld2"
    })
}
