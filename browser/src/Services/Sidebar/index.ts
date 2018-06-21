import { commandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { windowManager } from "./../../Services/WindowManager"
import { Workspace } from "./../../Services/Workspace"

import { SidebarManager } from "./SidebarStore"

let _sidebarManager: SidebarManager = null

export * from "./SidebarStore"

export const activate = (configuration: Configuration, workspace: Workspace) => {
    // Always create the sidebar to prevent issues. If its disabled, just hide it.
    // See #1562 for more information.
    _sidebarManager = new SidebarManager(windowManager, configuration)

    const sideBarEnabled = configuration.getValue("sidebar.enabled")

    if (!sideBarEnabled) {
        _sidebarManager.hide()
    }

    if (sideBarEnabled && !configuration.getValue("sidebar.default.open")) {
        _sidebarManager.toggleSidebarVisibility()
    }

    commandManager.registerCommand({
        command: "sidebar.increaseWidth",
        name: "Sidebar: Increase Width",
        detail: "Increase the width of the sidebar pane",
        execute: () => _sidebarManager.increaseWidth(),
    })

    commandManager.registerCommand({
        command: "sidebar.decreaseWidth",
        name: "Sidebar: Decrease Width",
        detail: "Decrease the width of the sidebar pane",
        execute: () => _sidebarManager.decreaseWidth(),
    })

    commandManager.registerCommand({
        command: "sidebar.toggle",
        name: "Sidebar: Toggle",
        detail: "Show / hide the contents of the sidebar pane.",
        execute: () => _sidebarManager.toggleSidebarVisibility(),
    })
}

export const getInstance = (): SidebarManager => _sidebarManager
