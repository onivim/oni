import { commandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { editorManager } from "./../../Services/EditorManager"
import { windowManager } from "./../../Services/WindowManager"
import { Workspace } from "./../../Services/Workspace"

import { ExplorerSplit } from "./../Explorer/ExplorerSplit"
import { SidebarManager } from "./SidebarStore"

let _sidebarManager: SidebarManager = null

export * from "./SidebarStore"

export const activate = (configuration: Configuration, workspace: Workspace) => {
    if (configuration.getValue("sidebar.enabled")) {
        _sidebarManager = new SidebarManager(windowManager)
        _sidebarManager.add("files-o", new ExplorerSplit(workspace, commandManager, editorManager))

        commandManager.registerCommand({
            command: "sidebar.toggle",
            name: "Sidebar: Toggle",
            detail: "Show / hide the contents of the sidebar pane.",
            execute: () => _sidebarManager.toggleSidebarVisibility(),
        })
    }
}

export const getInstance = (): SidebarManager => _sidebarManager
