/**
 * ExplorerStoreTests.ts
 */

import * as assert from "assert"
import * as path from "path"

import { Store } from "redux"
import { MockStoreCreator } from "redux-mock-store"
import { createEpicMiddleware } from "redux-observable"

import * as ExplorerFileSystem from "./../../../src/Services/Explorer/ExplorerFileSystem"
import * as ExplorerState from "./../../../src/Services/Explorer/ExplorerStore"

import * as TestHelpers from "./../../TestHelpers"

const configureMockStore = require("redux-mock-store") // tslint:disable-line
const epicMiddleware = createEpicMiddleware(ExplorerState.clearYankRegisterEpic)

const MemoryFileSystem = require("memory-fs") // tslint:disable-line
const mockStore: MockStoreCreator<ExplorerState.IExplorerState> = configureMockStore([
    epicMiddleware,
])

describe("ExplorerStore", async () => {
    let fileSystem: any
    let store: Store<ExplorerState.IExplorerState>

    const rootPath = path.normalize(path.join(TestHelpers.getRootDirectory(), "a", "test", "dir"))
    const filePath = path.join(rootPath, "file.txt")
    const target = { filePath, id: "1" }
    const epicStore = mockStore({ ...ExplorerState.DefaultExplorerState })

    beforeEach(() => {
        fileSystem = new MemoryFileSystem()
        fileSystem.mkdirpSync(rootPath)
        fileSystem.writeFileSync(filePath, "Hello World")

        const explorerFileSystem = new ExplorerFileSystem.FileSystem(fileSystem as any)
        store = ExplorerState.createStore(explorerFileSystem)
    })

    afterEach(() => {
        epicMiddleware.replaceEpic(ExplorerState.clearYankRegisterEpic)
    })

    describe("SET_ROOT_DIRECTORY", () => {
        it("expands directory automatically", async () => {
            store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath,
            })

            await TestHelpers.waitForAllAsyncOperations()

            // At this point, the FS operations are synchronous
            const state = store.getState()

            assert.deepEqual(
                state.expandedFolders[rootPath],
                [{ type: "file", fullPath: filePath }],
                "Validate expanded folders is set",
            )
        })
    })

    describe("YANK_AND_PASTE_EPICS", async () => {
        it("dispatches a clear register action after a minute", async () => {
            epicStore.dispatch({ type: "YANK", target })
            const actions = epicStore.getActions()
            await TestHelpers.waitForAllAsyncOperations()
            // three because an init action is sent first
            await assert.ok(actions.length === 3)
            const clearedRegister = !!actions.find(action => action.type === "CLEAR_REGISTER")
            assert.ok(clearedRegister)
        })
    })

    describe("Store utility helper tests", () => {
        it("Should not add an action if it isn't set to persist", () => {
            const testAction = {
                type: "DELETE_SUCCESS",
                persist: false,
                target: { id: "2", type: "file", filePath },
            } as ExplorerState.IDeleteSuccessAction
            const newState = ExplorerState.shouldAddDeletion(testAction)
            assert.ok(newState.length === 0 && Array.isArray(newState))
        })

        it("Should return an action if it is set to persist", () => {
            const testAction = {
                type: "DELETE_SUCCESS",
                persist: true,
                target: { id: "2", type: "file", filePath },
            } as ExplorerState.IDeleteSuccessAction
            const newState = ExplorerState.shouldAddDeletion(testAction)
            assert.deepEqual(newState[0], testAction)
        })
    })
})
