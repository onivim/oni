import { commandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { editorManager } from "./../../Services/EditorManager"
import { windowManager } from "./../../Services/WindowManager"
import { Workspace } from "./../../Services/Workspace"

import { ExplorerSplit } from "./../Explorer/ExplorerSplit"
import { SidebarContentSplit } from "./SidebarContentSplit"
import { SidebarSplit } from "./SidebarSplit"
import { SidebarManager } from "./SidebarStore"

import { SidebarPane } from "./SidebarPane"

let _sidebarManager: SidebarManager = null

export const activate = (configuration: Configuration, workspace: Workspace) => {

    _sidebarManager = new SidebarManager()

    if (configuration.getValue("experimental.sidebar.enabled")) {
        const leftDock = windowManager.getDock("left")
        leftDock.addSplit(new SidebarSplit(_sidebarManager))
        leftDock.addSplit(new SidebarContentSplit(_sidebarManager))

        _sidebarManager.add("files-o", new ExplorerSplit(workspace, commandManager, editorManager))

        const tasksPane = new SidebarPane("oni.sidebar.tasks", "Tasks")
        _sidebarManager.add("cogs", tasksPane)

        const bookmarksPane = new SidebarPane("oni.sidebar.bookmarks", "Bookmarks")
        _sidebarManager.add("bookmark", bookmarksPane)

        const searchPane = new SidebarPane("oni.sidebar.search", "Search")
        _sidebarManager.add("search", searchPane)
    }
}

export const getInstance = (): SidebarManager => _sidebarManager
