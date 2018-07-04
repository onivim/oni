import * as Oni from "oni-api"
import { Event } from "oni-types"

import {
    VersionControlManager,
    VersionControlProvider,
} from "./../browser/src/Services/VersionControl"

import MockCommands from "./mocks/CommandManager"
import MockEditorManager from "./mocks/EditorManager"
import MockMenu from "./mocks/MenuManager"
import MockNotifications from "./mocks/Notifications"
import MockSidebar from "./mocks/Sidebar"
import MockStatusbar, { mockStatusBarHide } from "./mocks/Statusbar"
import MockWorkspace from "./mocks/Workspace"

jest.unmock("lodash")

const provider: VersionControlProvider = {
    name: "svn",
    onFileStatusChanged: new Event(),
    onBranchChanged: new Event(),
    onPluginActivated: new Event(),
    onPluginDeactivated: new Event(),
    onStagedFilesChanged: new Event(),
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
    getBranch: () => Promise.resolve("local"),
}

describe("Version Control Manager tests", () => {
    let vcsManager: VersionControlManager
    beforeEach(() => {
        vcsManager = new VersionControlManager(
            new MockWorkspace(),
            new MockEditorManager(),
            new MockStatusbar(),
            new MockMenu(),
            new MockCommands(),
            new MockSidebar(),
            new MockNotifications(),
        )
        vcsManager.registerProvider(provider)
    })

    it("Should register a vcs provider", () => {
        expect(vcsManager.providers.size).toBe(1)
    })

    it("Should register the provider details", () => {
        expect(vcsManager.activeProvider.name).toBe("svn")
    })

    it("should correctly deregister a provider", () => {
        vcsManager.deactivateProvider()
        expect(vcsManager.activeProvider).toBeFalsy()
    })

    it("Should correctly hide the status bar item if the dir cannot handle the workspace", () => {
        provider.canHandleWorkspace = async () => Promise.resolve(false)
        vcsManager.registerProvider(provider)
        expect(mockStatusBarHide.mock.calls.length).toBe(1)
    })

    it("should return the correct branch", async () => {
        const branch = await provider.getBranch()
        expect(branch).toBe("local")
    })

    it("Should return the correct local branches", async () => {
        const localBranches = await provider.getLocalBranches()
        expect(localBranches).toEqual(expect.arrayContaining(["branch1", "branch2"]))
    })
})
