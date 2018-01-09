/**
 * ExplorerStoreTests.ts
 */

import * as assert from "assert"

import { Store } from "redux"

import * as ExplorerFileSystem from "./../../../src/Services/Explorer/ExplorerFileSystem"
import * as ExplorerState from "./../../../src/Services/Explorer/ExplorerStore"

const MemoryFileSystem = require("memory-fs")

describe("ExplorerStore", () => {

    let fileSystem: any
    let store: Store<ExplorerState.IExplorerState>

    const clock: any = global["clock"]
    const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

    beforeEach(() => {
        fileSystem = new MemoryFileSystem()
        fileSystem.mkdirpSync("C:\\a\\test\\dir")
        fileSystem.writeFileSync("C:\\a\\test\\dir\\file.txt", "Hello World")

        const explorerFileSystem = new ExplorerFileSystem.FileSystem(fileSystem as any)
        store = ExplorerState.createStore(explorerFileSystem)
    })

    describe("SET_ROOT_DIRECTORY", () => {

        it("expands directory automatically", async () => {
            store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath: "C:\\a\\test\\dir"
            })

            await waitForPromiseResolution()
            clock.runAll()

            // At this point, the FS operations are synchronous
            const state = store.getState()

            assert.deepEqual(state.expandedFolders["C:\\a\\test\\dir"], [
                { type: "file", fullPath: "C:\\a\\test\\dir\\file.txt" },
            ], "Validate expanded folders is set")
        })
    })
})
