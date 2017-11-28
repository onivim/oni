/**
 * Test scripts for QuickOpen
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { getCompletionElement } from "./Common"

export const test = async (oni: any) => {
    const dir = os.tmpdir()
    const testFileName = `testFile-${new Date().getTime()}.css`
    const tempFilePath = path.join(dir, testFileName)
    oni.automation.sendKeys(":e " + tempFilePath)
    oni.automation.sendKeys("<cr>")
    await oni.automation.sleep(500)
    oni.automation.sendKeys("i")
    oni.automation.sendKeys(".test { pos")

    // Wait for completion popup to show
    await oni.automation.waitFor(() => getCompletionElement() !== null)

    // Check for 'alert' as an available completion
    const completionElement = getCompletionElement()
    const textContent = completionElement.textContent

    assert.ok(textContent.indexOf("position") >= 0, "Verify 'position' was presented as a completion")
}
