/**
 * Test scripts for QuickOpen
 */

import * as Oni from "oni-api"

import * as os from "os"
import * as path from "path"

export const getCompletionElement = () => {
    return getElementByClassName("autocompletion")
}

export const getElementByClassName = (className: string) => {

    const elements = document.body.getElementsByClassName(className)

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0]
    }
}

export const createNewFile = async (fileExtension: string, oni: Oni.Plugin.Api): Promise<void> => {
    const dir = os.tmpdir()
    const testFileName = `testFile-${new Date().getTime()}.${fileExtension}`
    const tempFilePath = path.join(dir, testFileName)

    oni.automation.sendKeys(":e " + tempFilePath)
    oni.automation.sendKeys("<cr>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.activeBuffer.filePath === tempFilePath, 10000)
}
