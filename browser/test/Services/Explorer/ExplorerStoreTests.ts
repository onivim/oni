/**
 * ExplorerStoreTests.ts
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { Store } from "redux"

import * as ExplorerFileSystem from "./../../../src/Services/Explorer/ExplorerFileSystem"
import * as ExplorerState from "./../../../src/Services/Explorer/ExplorerStore"

import * as TestHelpers from "./../../TestHelpers"

const MemoryFileSystem = require("memory-fs") // tslint:disable-line

describe("ExplorerStore", () => {

    let fileSystem: any
    let store: Store<ExplorerState.IExplorerState>

    const top = os.platform() === "win32" ? "C:/" : "/top"
    const rootPath = path.normalize(path.join(top, "a", "test", "dir"))
    const filePath = path.join(rootPath, "file.txt")

    beforeEach(() => {
        fileSystem = new MemoryFileSystem()
        fileSystem.mkdirpSync(rootPath)
        fileSystem.writeFileSync(filePath, "Hello World")

        const explorerFileSystem = new ExplorerFileSystem.FileSystem(fileSystem as any)
        store = ExplorerState.createStore(explorerFileSystem)
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

            assert.deepEqual(state.expandedFolders[rootPath], [
                { type: "file", fullPath: filePath },
            ], "Validate expanded folders is set")
        })
    })
})
