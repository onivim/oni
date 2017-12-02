/**
 * Test scripts for QuickOpen
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

const getCompletionElement = () => {

    const elements = document.body.getElementsByClassName("autocompletion")

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0]
    }
}

export const test = async (oni: any) => {
    const dir = os.tmpdir()
    const testFileName = `testFile-${new Date().getTime()}.ts`
    const tempFilePath = path.join(dir, testFileName)
    oni.automation.sendKeys(":e " + tempFilePath)
    oni.automation.sendKeys("<cr>")
    await oni.automation.sleep(500)
    oni.automation.sendKeys("i")
    oni.automation.sendKeys("window.a")

    // Wait for completion popup to show
    await oni.automation.waitFor(() => getCompletionElement() !== null)

    // Check for 'alert' as an available completion
    const completionElement = getCompletionElement()
    const textContent = completionElement.textContent

    assert.ok(textContent.indexOf("alert") >= 0, "Verify 'alert' was presented as a completion")
}
