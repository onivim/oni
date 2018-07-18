import { Store } from "redux"

import store from "./../browser/src/Services/VersionControl/VersionControlStore"

describe("Version control reducer test", () => {
    const vcsStore = store

    it("Should correctly update the store with the vcs status", () => {
        const status = {
            currentBranch: "master",
            staged: ["/test.txt"],
            conflicted: [],
            created: [],
            modified: [],
            remoteTrackingBranch: "origin/master",
            deleted: [],
            untracked: [],
            ahead: null,
            behind: null,
        }

        vcsStore.dispatch({ type: "STATUS", payload: { status } })
        const state = vcsStore.getState()
        expect(state.status.currentBranch).toBe("master")
        expect(state.status.staged[0]).toBe("/test.txt")
    })

    it("should correctly update the focus state", () => {
        vcsStore.dispatch({ type: "ENTER" })
        const state = store.getState()
        expect(state.hasFocus).toBe(true)
    })

    it("Should correctly register an error", () => {
        vcsStore.dispatch({ type: "ERROR" })
        const state = store.getState()
        expect(state.hasError).toBe(true)
    })
})
