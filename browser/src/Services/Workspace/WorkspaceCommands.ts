/**
 * WorkspaceCommands.ts
 *
 * Commands registered for the workspace
 */
import * as fs from "fs"
import * as path from "path"

import * as mkdirp from "mkdirp"

import { CallbackCommand, commandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import * as FileMappings from "./../FileMappings"
import { SnippetManager } from "./../Snippets"

import { Workspace } from "./Workspace"

export const activateCommands = (
    configuration: Configuration,
    editorManager: EditorManager,
    snippetManager: SnippetManager,
    workspace: Workspace,
) => {
    const openTestFileInSplit = async () => {
        const mappingResult = getTestFileMappedToCurrentFile()
        const mappedFile = mappingResult.fullPath
        const templateFile = mappingResult.templateFileFullPath

        if (mappedFile) {
            let snippetToInsert: string = null

            if (!fs.existsSync(mappedFile)) {
                // Ensure the folder exists for the mapped file
                const containingFolder = path.dirname(mappedFile)
                mkdirp.sync(containingFolder)

                if (templateFile && fs.existsSync(templateFile)) {
                    snippetToInsert = fs.readFileSync(templateFile).toString("utf8")
                }
            }

            await editorManager.activeEditor.openFile(mappedFile)

            if (snippetToInsert) {
                await snippetManager.insertSnippet(snippetToInsert)
            }
        }
    }

    const hasExistingTestFile = () => {
        const mappedFile = getTestFileMappedToCurrentFile()

        return mappedFile && fs.existsSync(mappedFile.fullPath)
    }

    const canCreateTestFile = () => {
        const mappedFile = getTestFileMappedToCurrentFile()

        return mappedFile && !fs.existsSync(mappedFile.fullPath)
    }

    const getTestFileMappedToCurrentFile = (): FileMappings.IFileMappingResult => {
        const mappings: FileMappings.IFileMapping[] = configuration.getValue(
            "workspace.testFileMappings",
        )

        if (!mappings) {
            return null
        }

        const currentEditor = editorManager.activeEditor

        if (!currentEditor || !currentEditor.activeBuffer) {
            return null
        }

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
            () => workspace.openFolder(),
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
