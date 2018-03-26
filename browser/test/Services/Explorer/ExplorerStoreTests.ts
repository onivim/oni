/**
 * ExplorerStoreTests.ts
 */

import * as assert from "assert"
import * as path from "path"

import { Store } from "redux"
import configureMockStore from "redux-mock-store"
import { createEpicMiddleware } from "redux-observable"

import * as ExplorerFileSystem from "./../../../src/Services/Explorer/ExplorerFileSystem"
import * as ExplorerState from "./../../../src/Services/Explorer/ExplorerStore"

import * as TestHelpers from "./../../TestHelpers"
const epicMiddleware = createEpicMiddleware(ExplorerState.clearYankRegisterEpic)

const MemoryFileSystem = require("memory-fs") // tslint:disable-line
const mockStore = configureMockStore([epicMiddleware])

describe("ExplorerStore", () => {
    let fileSystem: any
    let store: Store<ExplorerState.IExplorerState>
    const epicStore = mockStore()

    const rootPath = path.normalize(path.join(TestHelpers.getRootDirectory(), "a", "test", "dir"))
    const filePath = path.join(rootPath, "file.txt")

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
    it("dispatches a clear register action after a minute", async () => {
        // TODO
        epicStore.dispatch({ type: "YANK" })
        await setTimeout(() => assert.ok(epicStore.getActions().length === 2), 700000)
    })
})
