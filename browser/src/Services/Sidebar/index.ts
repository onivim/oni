import { commandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { editorManager } from "./../../Services/EditorManager"
import { windowManager } from "./../../Services/WindowManager"
import { workspace } from "./../../Services/Workspace"

import { ExplorerSplit } from "./../Explorer/ExplorerSplit"
import { SidebarContentSplit } from "./SidebarContentSplit"
import { SidebarSplit } from "./SidebarSplit"
import { SidebarManager } from "./SidebarStore"

import { ItemWidget, LabelWidget, SidebarPane } from "./SidebarPane"

let _sidebarManager: SidebarManager = null

export const activate = (configuration: Configuration) => {

    _sidebarManager = new SidebarManager()

    if (configuration.getValue("experimental.sidebar.enabled")) {
        const leftDock = windowManager.getDock(2)
        leftDock.addSplit(new SidebarSplit(_sidebarManager))
        leftDock.addSplit(new SidebarContentSplit(_sidebarManager))

        const searchPane = new SidebarPane("oni.sidebar.search", "Search")
        _sidebarManager.add("search", searchPane)

        searchPane.set([new LabelWidget(), new LabelWidget(), new ItemWidget("oni.test"), new ItemWidget("oni.test2")])

        // Sidebar items
        // TODO: Move to extensions
        _sidebarManager.add("files-o", new ExplorerSplit(configuration, workspace, commandManager, editorManager))

        // _sidebarManager.add("th", {
        //     id: "plugins",
        //     title: "Plugins",
        //     render: () => null,
        // })
    }
}

export const getInstance = (): SidebarManager => _sidebarManager
