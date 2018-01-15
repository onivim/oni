import { commandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { editorManager } from "./../../Services/EditorManager"
import { windowManager } from "./../../Services/WindowManager"
import { Workspace } from "./../../Services/Workspace"

import { ExplorerSplit } from "./../Explorer/ExplorerSplit"
import { SidebarContentSplit } from "./SidebarContentSplit"
import { SidebarSplit } from "./SidebarSplit"
import { SidebarManager } from "./SidebarStore"

let _sidebarManager: SidebarManager = null

export const activate = (configuration: Configuration, workspace: Workspace) => {

    _sidebarManager = new SidebarManager()

    if (configuration.getValue("experimental.sidebar.enabled")) {
        const leftDock = windowManager.getDock(2)
        leftDock.addSplit(new SidebarSplit(_sidebarManager))
        leftDock.addSplit(new SidebarContentSplit(_sidebarManager))

        // Sidebar items
        // TODO: Move to extensions
        _sidebarManager.add("files-o", new ExplorerSplit(configuration, workspace, commandManager, editorManager))

        _sidebarManager.add("search", {
            id: "search",
            title: "Search",
            render: () => null,
        })

        _sidebarManager.add("th", {
            id: "plugins",
            title: "Plugins",
            render: () => null,
        })
    }
}

export const getInstance = (): SidebarManager => _sidebarManager
