import * as Oni from "oni-api"

import { CommandManager } from "./../browser/src/Services/CommandManager"
import { EditorManager } from "./../browser/src/Services/EditorManager"
import { MenuManager } from "./../browser/src/Services/Menu"
import { Notifications } from "./../browser/src/Services/Notifications"
import { SidebarManager } from "./../browser/src/Services/Sidebar"
import {
    VersionControlManager,
    VersionControlProvider,
} from "./../browser/src/Services/VersionControl"
import { IWorkspace, Workspace } from "./../browser/src/Services/Workspace"

const MockWorkspace = jest.fn<IWorkspace>().mockImplementation(() => ({
    activeDirectory: "test/dir",
}))

const MockEditorManager = jest.fn<EditorManager>().mockImplementation(() => ({
    activeDirectory: "test/dir",
}))

const MockStatusbar = jest.fn<Oni.StatusBar>().mockImplementation(() => ({
    activeDirectory: "test/dir",
}))

const MockSidebar = jest.fn<SidebarManager>().mockImplementation(() => ({
    activeDirectory: "test/dir",
}))

const MockMenu = jest.fn<MenuManager>().mockImplementation(() => ({
    activeDirectory: "test/dir",
}))

const MockCommands = jest.fn<CommandManager>().mockImplementation(() => ({
    activeDirectory: "test/dir",
}))

const MockNotifications = jest.fn<Notifications>().mockImplementation(() => ({}))

const provider: VersionControlProvider = {
    name: "svn",
    onFileStatusChanged: null,
    onBranchChanged: null,
    onPluginActivated: null,
    onPluginDeactivated: null,
    onStagedFilesChanged: null,
    isActivated: true,
    fetchBranchFromRemote: () => null,
    stageFile: () => null,
    changeBranch: () => null,
    getLocalBranches: () => Promise.resolve(["branch1", "branch2"]),
    canHandleWorkspace: () => Promise.resolve(true),
    getDiff: () => Promise.resolve({}),
    activate: () => null,
    deactivate: () => null,
    getStatus: () => Promise.resolve({}),
    getRoot: () => Promise.resolve("/test/dir"),
    getBranch: (path: string) => Promise.resolve("local"),
}

describe("Version Control Manager tests", () => {
    it("Should register a vcs provider", () => {
        const vcsManager = new VersionControlManager(
            new MockWorkspace(),
            new MockEditorManager(),
            new MockStatusbar(),
            new MockMenu(),
            new MockCommands(),
            new MockSidebar(),
            new MockNotifications(),
        )
        vcsManager.registerProvider(provider)
        expect(vcsManager.providers.size).toBe(1)
    })
})
