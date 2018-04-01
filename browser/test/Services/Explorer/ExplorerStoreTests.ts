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
            const overOneMinute = 60000 + 1000
            const actions = epicStore.getActions()
            await setTimeout(() => assert.ok(actions.length === 2), overOneMinute)
            const clearedRegister = !!actions.find(action => action.type === "CLEAR_REGISTER")
            assert.ok(clearedRegister)
        })
    })
})
