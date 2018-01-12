/**
 * WorkspaceCommands.ts
 *
 * Commands registered for the workspace
 */
import { remote } from "electron"

import { Configuration } from "./Configuration"
import { workspace } from "./Workspace"
import { CallbackCommand, commandManager } from "./CommandManager"
import { EditorManager } from "./EditorManager"
import * as FileMappings from "./FileMappings"

export const activateCommands = (configuration: Configuration, editorManager: EditorManager) => {
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

        const mappedFile = FileMappings.getMappedFile(workspace)

        // TODO: Get current workspace directory and map to it
        // WAITING on configuration work

    }

    const commands = [
        new CallbackCommand("workspace.openFolder", "Open Folder", "Set a folder as the working directory for Oni", () => openFolder()),
    ]

    commands.forEach((c) => commandManager.registerCommand(c))
    
}
