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

export const getCollateralPath = () => {
    return path.join(__dirname, "..", "..", "..", "test", "collateral")
}

export const getElementByClassName = (className: string): HTMLElement => {
    const elements = document.body.getElementsByClassName(className)

    if (!elements || !elements.length) {
        return null
    } else {
        return elements[0] as HTMLElement
    }
}

export const getElementsBySelector = (selector: string) => {
    const elements = document.body.querySelectorAll(selector)
    return elements || []
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

export const waitForCommand = async (command: string, oni: Oni.Plugin.Api): Promise<void> => {
    return oni.automation.waitFor(() => {
        const anyCommands = oni.commands as any
        return anyCommands.hasCommand(command)
    }, 10000)
}
