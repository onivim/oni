import { commandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { windowManager } from "./../../Services/WindowManager"
import { Workspace } from "./../../Services/Workspace"

import { SidebarManager } from "./SidebarStore"

let _sidebarManager: SidebarManager = null

export * from "./SidebarStore"

export const activate = (configuration: Configuration, workspace: Workspace) => {
    if (configuration.getValue("sidebar.enabled")) {
        _sidebarManager = new SidebarManager(windowManager)

        commandManager.registerCommand({
            command: "sidebar.toggle",
            name: "Sidebar: Toggle",
            detail: "Show / hide the contents of the sidebar pane.",
            execute: () => _sidebarManager.toggleSidebarVisibility(),
        })
    } else {
        _sidebarManager = new SidebarManager()
    }
}

export const getInstance = (): SidebarManager => _sidebarManager
