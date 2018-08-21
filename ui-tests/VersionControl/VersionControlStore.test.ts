import { Store } from "redux"

import vcsStore from "./../../browser/src/Services/VersionControl/VersionControlStore"

describe("Version control reducer test", () => {
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
        const state = vcsStore.getState()
        expect(state.hasFocus).toBe(true)
    })

    it("Should correctly register an error", () => {
        vcsStore.dispatch({ type: "ERROR" })
        const state = vcsStore.getState()
        expect(state.hasError).toBe(true)
    })

    it("Should correctly set the selected item", () => {
        vcsStore.dispatch({ type: "SELECT", payload: { selected: "/test.txt" } })
        const state = vcsStore.getState()
        expect(state.selected).toBe("/test.txt")
    })

    it("Should correctly set the commit active on commit start", () => {
        vcsStore.dispatch({ type: "COMMIT_START", payload: { files: ["/test.txt"] } })
        const state = vcsStore.getState()
        expect(state.commit.active).toBe(true)
    })

    it("Should correctly set the commit active to false on commit cancel", () => {
        vcsStore.dispatch({ type: "COMMIT_CANCEL" })
        const state = vcsStore.getState()
        expect(state.commit.active).toBe(false)
    })

    it("Should set commit active to false on commit success and add the commit", () => {
        vcsStore.dispatch({ type: "COMMIT_START", payload: { files: ["/test.txt"] } })
        vcsStore.dispatch({
            type: "UPDATE_COMMIT_MESSAGE",
            payload: { message: ["commit message"] },
        })
        vcsStore.dispatch({ type: "COMMIT_SUCCESS", payload: { commit: { branch: "test" } } })
        const state = vcsStore.getState()
        expect(state.commit.active).toBe(false)
        expect(state.commit.previousCommits[0].message).toBe("commit message")
    })
})
