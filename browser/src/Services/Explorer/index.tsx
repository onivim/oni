/**
 * Explorer/index.tsx
 *
 * Entry point for explorer-related features
 */

import { CommandManager } from "./../CommandManager"
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

    sidebarManager.add(
        "files-o",
        new ExplorerSplit(configuration, workspace, commandManager, editorManager),
    )
}
