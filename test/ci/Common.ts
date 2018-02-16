/**
 * Common functions used across the CI tests.
 */

import * as Oni from "oni-api"

import * as fs from "fs"
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

export const createNewFile = async (
    fileExtension: string,
    oni: Oni.Plugin.Api,
    contents?: string,
): Promise<void> => {
    const tempFilePath = getTemporaryFilePath(fileExtension)

    if (contents) {
        fs.writeFileSync(tempFilePath, contents)
    }

    await navigateToFile(tempFilePath, oni)
}

export const getTemporaryFilePath = (fileExtension: string): string => {
    const dir = os.tmpdir()
    const testFileName = `testFile-${new Date().getTime()}.${fileExtension}`
    return path.join(dir, testFileName)
}

export const getTemporaryFolder = (): string => {
    const dir = os.tmpdir()
    const testFolderName = `oni-test-folder-${new Date().getTime()}`
    const testFolderPath = path.join(dir, testFolderName)
    return testFolderPath
}

export const navigateToFile = async (filePath: string, oni: Oni.Plugin.Api): Promise<void> => {
    oni.automation.sendKeys(":e " + filePath)
    oni.automation.sendKeys("<cr>")

    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.filePath === filePath,
        10000,
    )
}
