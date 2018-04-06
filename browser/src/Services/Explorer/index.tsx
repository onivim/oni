/**
 * Explorer/index.tsx
 *
 * Entry point for explorer-related features
 */

import { CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"
import { SidebarManager } from "./../Sidebar"
import { Workspace } from "./../Workspace"

import { ExplorerSplit } from "./ExplorerSplit"

export const activate = (
    commandManager: CommandManager,
    editorManager: EditorManager,
    sidebarManager: SidebarManager,
    workspace: Workspace,
) => {
    sidebarManager.add("files-o", new ExplorerSplit(workspace, commandManager, editorManager))

    const toggleExplorer = () => {
        sidebarManager.toggleVisibilityById("oni.sidebar.explorer")
    }

    commandManager.registerCommand({
        command: "explorer.toggle",
        name: "Explorer: Toggle Visiblity",
        detail: "Toggles the explorer in the sidebar",
        execute: toggleExplorer,
        enabled: () => !!workspace.activeWorkspace,
    })
}
