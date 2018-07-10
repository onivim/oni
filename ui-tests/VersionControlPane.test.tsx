import * as Oni from "oni-api"
import { Event } from "oni-types"
import configureMockStore, { MockStoreCreator } from "redux-mock-store"

import { VersionControlProvider } from "../browser/src/Services/VersionControl"
import VersionControlPane from "./../browser/src/Services/VersionControl/VersionControlPane"
import { DefaultState, IState } from "./../browser/src/Services/VersionControl/VersionControlStore"
import VersionControlView from "./../browser/src/Services/VersionControl/VersionControlView"
import MockEditorManager from "./mocks/EditorManager"
import MockWorkspace from "./mocks/Workspace"

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
    const store = MockStore({ ...DefaultState })
    const vcsPane = new VersionControlPane(
        mockManager,
        mockWorkspace,
        provider,
        args => null,
        store,
    )

    it("Should create a new version control pane", () => {
        expect(vcsPane.id).toBe("oni.sidebar.vcs")
    })

    it("get status should return the value expected", async () => {
        const result = await vcsPane.getStatus()
        if (result) {
            expect(result.currentBranch).toEqual("master")
        }
    })

    // it("Should update the redux store with new status", async () => {
    // const result = await vcsPane.getStatus()
    // const state = store.getState()
    // const actions = store.getActions()
    // expect(state.status.currentBranch).toEqual("master")
    // })
})
