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
}
