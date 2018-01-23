/**
 * WorkspaceCommands.ts
 *
 * Commands registered for the workspace
 */
import { remote } from "electron"

import { CallbackCommand, commandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import * as FileMappings from "./../FileMappings"

import { Workspace } from "./Workspace"

export const activateCommands = (configuration: Configuration, editorManager: EditorManager, workspace: Workspace) => {
    const openFolder = () => {

        const dialogOptions: any = {
            title: "Open Folder",
            properties: ["openDirectory"],
        }

        remote.dialog.showOpenDialog(remote.getCurrentWindow(), dialogOptions, (folder: string[]) => {
            if (!folder || !folder[0]) {
                return
            }

            const folderToOpen = folder[0]
            workspace.changeDirectory(folderToOpen)
        })
    }

    const openTestFileInSplit = () => {
        const mappings: FileMappings.IFileMapping[] = configuration.getValue("workspace.testFileMappings")

        if (!mappings) {
            return
        }

        const currentEditor = editorManager.activeEditor
        const currentBufferPath = currentEditor.activeBuffer.filePath

        if (!currentBufferPath) {
            return
        }

        const mappedFile = FileMappings.getMappedFile(workspace.activeWorkspace, currentBufferPath, mappings)

        editorManager.activeEditor.openFile(mappedFile)

        // TODO: Get current workspace directory and map to it
        // WAITING on configuration work

    }

    const commands = [
        new CallbackCommand("workspace.openFolder", "Workspace: Open Folder", "Set a folder as the working directory for Oni", () => openFolder(), () => workspace.activeWorkspace === null),
        new CallbackCommand("workspace.openTestFile", "Workspace: Open Test File", "Open the test file corresponding to this source file.", () => openTestFileInSplit()),
        new CallbackCommand("workspace.closeFolder", "Workspace: Close Folder", "Close the current folder", () => workspace.changeDirectory(null), () => workspace.activeWorkspace !== null)
    ]

    commands.forEach((c) => commandManager.registerCommand(c))

}
