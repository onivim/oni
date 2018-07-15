/**
 * Explorer/index.tsx
 *
 * Entry point for explorer-related features
 */

import { CallbackCommand, CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { SidebarManager } from "./../Sidebar"
import { Workspace } from "./../Workspace"
import { ExplorerSplit } from "./ExplorerSplit"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    sidebarManager: SidebarManager,
    workspace: Workspace,
) => {
    configuration.registerSetting("explorer.autoRefresh", {
        description:
            "When set to true, the explorer will listen for changes on the file system and refresh automatically.",
        requiresReload: true,
        defaultValue: false,
    })

    const explorerSplit: ExplorerSplit = new ExplorerSplit(
        configuration,
        workspace,
        commandManager,
        editorManager,
    )
    sidebarManager.add("files-o", explorerSplit)

    const explorerId = "oni.sidebar.explorer"

    commandManager.registerCommand(
        new CallbackCommand(
            "explorer.toggle",
            "Explorer: Toggle Visibility",
            "Toggles the explorer in the sidebar",
            () => sidebarManager.toggleVisibilityById(explorerId),
            () => !!workspace.activeWorkspace,
        ),
    )

    commandManager.registerCommand(
        new CallbackCommand(
            "explorer.locate.buffer",
            "Explorer: Locate Current Buffer",
            "Locate current buffer in file tree",
            () => {
                if (sidebarManager.activeEntryId !== explorerId || !sidebarManager.isVisible) {
                    sidebarManager.setActiveEntry(explorerId)
                }
                explorerSplit.locateFile(editorManager.activeEditor.activeBuffer.filePath)
            },
            () => !!workspace.activeWorkspace,
        ),
    )
}
