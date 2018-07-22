/**
 * Test script to validate explorer locating currently open buffer
 */

import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import { getElementsBySelector, getTemporaryFolder, navigateToFile, waitForCommand } from "./Common"

const command = "explorer.locate.buffer"
const fileToLocate = "file.ts"

const isFileToLocateVisibleAndHighlighted = () => {
    return !![].slice
        .call(getElementsBySelector("div.item > div[icon]"))
        .filter(el => getComputedStyle(el)["background-color"] !== "rgba(0, 0, 0, 0)")
        .map(el => el.parentElement.textContent)
        .filter(text => text === fileToLocate).length
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()
    // Wait for sidebar split to appear
    await oni.automation.waitFor(() => document.querySelectorAll(".sidebar-content").length === 1)
    // Ensure command exists.
    await waitForCommand(command, oni)
    // Create our "workspace"
    const rootPath = getTemporaryFolder()
    fs.mkdirSync(rootPath)
    // Create workspace subdir.
    const directoryPath = path.join(rootPath, "src")
    fs.mkdirSync(directoryPath)
    // Create workspace file.
    const filePath = path.join(directoryPath, fileToLocate)
    fs.writeFileSync(filePath, "some stuff")
    // Switch to workspace.
    await oni.workspace.changeDirectory(rootPath)
    Log.info(`Created ${rootPath} and switched to workspace ${oni.workspace.activeWorkspace}`)
    // Open file in workspace.
    await navigateToFile(filePath, oni)
    // File shouldn't yet be shown in the explorer.
    await oni.automation.waitFor(() => !isFileToLocateVisibleAndHighlighted())
    // Execure the command to locate the file in the explorer.
    oni.commands.executeCommand(command)
    // File should now be shown in the explorer.
    await oni.automation.waitFor(() => isFileToLocateVisibleAndHighlighted())
    // What happens if we hide the sidebar?
    await oni.commands.executeCommand("sidebar.toggle")
    // File is no longer shown in the explorer.
    await oni.automation.waitFor(() => !isFileToLocateVisibleAndHighlighted())
    // Execure the command to locate the file in the explorer.
    oni.commands.executeCommand(command)
    // File should now be shown in the explorer.
    await oni.automation.waitFor(() => isFileToLocateVisibleAndHighlighted())
}
