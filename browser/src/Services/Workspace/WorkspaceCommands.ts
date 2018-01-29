/**
 * WorkspaceCommands.ts
 *
 * Commands registered for the workspace
 */
import * as fs from "fs"
import * as path from "path"

import { remote } from "electron"
import * as mkdirp from "mkdirp"

import { CallbackCommand, commandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import * as FileMappings from "./../FileMappings"

import { Workspace } from "./Workspace"

export const activateCommands = (
    configuration: Configuration,
    editorManager: EditorManager,
    workspace: Workspace,
) => {
    const openFolder = () => {
        const dialogOptions: any = {
            title: "Open Folder",
            properties: ["openDirectory"],
        }

        remote.dialog.showOpenDialog(
            remote.getCurrentWindow(),
            dialogOptions,
            async (folder: string[]) => {
                if (!folder || !folder[0]) {
                    return
                }

                const folderToOpen = folder[0]
                await workspace.changeDirectory(folderToOpen)
            },
        )
    }

    const openTestFileInSplit = () => {
        const mappedFile = getTestFileMappedToCurrentFile()

        if (mappedFile) {
            if (!fs.existsSync(mappedFile)) {
                // Ensure the folder exists for the mapped file
                const containingFolder = path.dirname(mappedFile)
                mkdirp.sync(containingFolder)
            }

            editorManager.activeEditor.openFile(mappedFile)
        }
    }

    const hasExistingTestFile = () => {
        const mappedFile = getTestFileMappedToCurrentFile()

        return fs.existsSync(mappedFile)
    }

    const canCreateTestFile = () => {
        const mappedFile = getTestFileMappedToCurrentFile()

        return !fs.existsSync(mappedFile)
    }

    const getTestFileMappedToCurrentFile = (): string => {
        const mappings: FileMappings.IFileMapping[] = configuration.getValue(
            "workspace.testFileMappings",
        )

        if (!mappings) {
            return null
        }

        const currentEditor = editorManager.activeEditor
        const currentBufferPath = currentEditor.activeBuffer.filePath

        if (!currentBufferPath) {
            return null
        }

        const mappedFile = FileMappings.getMappedFile(
            workspace.activeWorkspace,
            currentBufferPath,
            mappings,
        )
        return mappedFile
    }

    const commands = [
        new CallbackCommand(
            "workspace.openFolder",
            "Workspace: Open Folder",
            "Set a folder as the working directory for Oni",
            () => openFolder(),
            () => !!!workspace.activeWorkspace,
        ),
        new CallbackCommand(
            "workspace.openTestFile",
            "Workspace: Open Test File",
            "Open the test file corresponding to this source file.",
            () => openTestFileInSplit(),
            () => hasExistingTestFile(),
        ),
        new CallbackCommand(
            "workspace.createTestFile",
            "Workspace: Create Test File",
            "Create a test file for this source file.",
            () => openTestFileInSplit(),
            () => canCreateTestFile(),
        ),
        new CallbackCommand(
            "workspace.closeFolder",
            "Workspace: Close Folder",
            "Close the current folder",
            async () => workspace.changeDirectory(null),
            () => !!workspace.activeWorkspace,
        ),
    ]

    commands.forEach(c => commandManager.registerCommand(c))
}
