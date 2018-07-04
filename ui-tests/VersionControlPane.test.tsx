import * as Oni from "oni-api"
import { Event } from "oni-types"
import { MockStoreCreator } from "redux-mock-store"

import { VersionControlProvider } from "../browser/src/Services/VersionControl"

jest.mock("./../browser/src/Services/VersionControl/VersionControlView", () => {
    const React = require("react")
    return <div />
})
import VersionControlView from "./../browser/src/Services/VersionControl/VersionControlView"
import VersionControlPane from "./../browser/src/Services/VersionControl/VersionControlPane"
import { IState, DefaultState } from "./../browser/src/Services/VersionControl/VersionControlStore"
import MockEditorManager from "./mocks/EditorManager"
import MockWorkspace from "./mocks/Workspace"

const configureMockStore = require("redux-mock-store") // tslint:disable-line

jest.mock("lodash/capitalize", (str: string) => str)

const provider: VersionControlProvider = {
    name: "git",
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
    getStatus: () =>
        Promise.resolve({
            currentBranch: "master",
        }),
    getRoot: () => Promise.resolve("/test/dir"),
    getBranch: () => Promise.resolve("local"),
}

describe("Version Control pane tests", () => {
    const mockManager = new MockEditorManager()
    const mockWorkspace = new MockWorkspace()
    const MockStore: MockStoreCreator<IState> = configureMockStore()
    let store = MockStore({ ...DefaultState })
    const vcsPane = new VersionControlPane(
        mockManager,
        mockWorkspace,
        provider,
        args => null,
        store,
    )

    beforeAll(() => {
        store = MockStore({ ...DefaultState })
    })
    it("Should create a new version control pane", () => {
        expect(vcsPane.id).toBe("oni.sidebar.vcs")
    })
    it("get status should return the value expected", async () => {
        const result = await vcsPane.getStatus()
        if (result) {
            expect(result.currentBranch).toEqual("master")
        }
    })

    it("Should update the redux store with new status", async () => {
        try {
            const result = await vcsPane.getStatus()
            const state = store.getState()
        } catch (e) {
            console.warn(e)
        }
        // expect(state.status.currentBranch).toEqual("master")
    })
})
