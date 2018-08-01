import * as Oni from "oni-api"
import { Event } from "oni-types"
import * as React from "react"

import { Branch } from "../../browser/src/UI/components/VersionControl/Branch"
import {
    VersionControlManager,
    VersionControlProvider,
} from "./../../browser/src/Services/VersionControl"

import { MockOni } from "../../browser/test/Mocks"
import MockCommands from "./../mocks/CommandManager"
import { configuration as MockConfiguration } from "./../mocks/Configuration"
import MockEditorManager from "./../mocks/EditorManager"
import MockMenu from "./../mocks/MenuManager"
import MockNotifications from "./../mocks/Notifications"
import MockSidebar from "./../mocks/Sidebar"
import MockStatusbar, { mockStatusBarHide, mockStatusBarSetContents } from "./../mocks/Statusbar"
//import MockWorkspace from "./../mocks/Workspace"

jest.unmock("lodash")

const makePromise = (arg?: any) => Promise.resolve(arg)

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
    getLocalBranches: () => makePromise(["branch1", "branch2"]),
    canHandleWorkspace: () => makePromise(true),
    getDiff: () => makePromise({}),
    activate: () => null,
    deactivate: () => null,
    getStatus: () => makePromise({}),
    getRoot: () => makePromise("/test/dir"),
    getBranch: () => makePromise("local"),
}

describe("Version Control Manager tests", () => {
    let vcsManager: VersionControlManager
    beforeEach(() => {
        vcsManager = new VersionControlManager(
            new MockOni(),
            //new MockWorkspace(),
            //new MockEditorManager(),
            //new MockStatusbar(),
            //new MockMenu(),
            //new MockCommands(),
            new MockSidebar(),
            new MockNotifications(),
            //MockConfiguration,
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

    it("Should correctly hide the status bar item if the dir cannot handle the workspace", async () => {
        provider.canHandleWorkspace = async () => makePromise(false)
        await vcsManager.registerProvider(provider)
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

    it("should set the contents of the statusbar correctly", () => {
        const branch = <Branch diff={{} as any} branch="local" />
        expect(mockStatusBarSetContents.mock.calls[0][0]).toEqual(branch)
    })
})
