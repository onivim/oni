import { commandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { editorManager } from "./../../Services/EditorManager"
import { windowManager } from "./../../Services/WindowManager"
import { workspace } from "./../../Services/Workspace"

import { SidebarManager } from "./SidebarStore"
import { SidebarSplit } from "./SidebarSplit"
import { ExplorerSplit } from "./../Explorer/ExplorerSplit"

let _sidebarManager: SidebarManager = null

export const activate = (configuration: Configuration) => {

    _sidebarManager = new SidebarManager()

    if (configuration.getValue("experimental.sidebar.enabled")) {
        const leftDock = windowManager.getDock(2)
        leftDock.addSplit(new SidebarSplit(_sidebarManager))
        leftDock.addSplit(new ExplorerSplit(configuration, workspace, commandManager, editorManager))
    }
}

export const getInstance = (): SidebarManager => _sidebarManager
