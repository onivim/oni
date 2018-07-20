import * as Oni from "oni-api"
import { Event } from "oni-types"

import { VersionControlProvider } from "./../../browser/src/Services/VersionControl"
import VersionControlPane from "./../../browser/src/Services/VersionControl/VersionControlPane"
import store, {
    DefaultState,
    VersionControlState,
} from "./../../browser/src/Services/VersionControl/VersionControlStore"
import MockCommands from "./../mocks/CommandManager"
import MockEditorManager from "./../mocks/EditorManager"
import MockWorkspace from "./../mocks/Workspace"

jest.mock("lodash/capitalize", (str: string) => str)
jest.mock(
    "./../../browser/src/Services/VersionControl/VersionControlView",
    () => "VersionControlView",
)

const makePromise = (arg?: any) => Promise.resolve(arg)

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
    getLocalBranches: () => makePromise(["branch1", "branch2"]),
    canHandleWorkspace: () => makePromise(true),
    getDiff: () => makePromise({}),
    activate: () => null,
    deactivate: () => null,
    getStatus: () =>
        makePromise({
            currentBranch: "master",
        }),
    getRoot: () => makePromise("/test/dir"),
    getBranch: () => makePromise("local"),
}

describe("Version Control pane tests", () => {
    const mockManager = new MockEditorManager()
    const mockWorkspace = new MockWorkspace()
    const mockCommands = new MockCommands()
    const vcsStore = store
    const vcsPane = new VersionControlPane(
        mockManager,
        mockWorkspace,
        provider,
        args => null,
        mockCommands,
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
    it("Correctly update the store", async () => {
        await vcsPane.getStatus()
        const state = store.getState()
        expect(state.status.currentBranch).toBe("master")
    })
})
