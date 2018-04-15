/**
 * ExplorerStoreTests.ts
 */

import * as assert from "assert"
import * as path from "path"

import { Store } from "redux"

import * as ExplorerFileSystem from "./../../../src/Services/Explorer/ExplorerFileSystem"
import * as ExplorerState from "./../../../src/Services/Explorer/ExplorerStore"

import * as TestHelpers from "./../../TestHelpers"

const MemoryFileSystem = require("memory-fs") // tslint:disable-line

export class MockedFileSystem implements ExplorerFileSystem.IFileSystem {
    public promises: Array<Promise<any>>

    constructor(private _inner: ExplorerFileSystem.IFileSystem) {
        this.promises = []
    }

    public readdir(directoryPath: string): Promise<ExplorerState.FolderOrFile[]> {
        const promise = this._inner.readdir(directoryPath)
        this.promises.push(promise)
        return promise
    }

    public exists(fullPath: string): Promise<boolean> {
        const promise = this._inner.exists(fullPath)
        this.promises.push(promise)
        return promise
    }
}

describe("ExplorerStore", () => {
    let fileSystem: any
    let store: Store<ExplorerState.IExplorerState>
    let explorerFileSystem: MockedFileSystem

    const rootPath = path.normalize(path.join(TestHelpers.getRootDirectory(), "a", "test", "dir"))
    const filePath = path.join(rootPath, "file.txt")

    beforeEach(() => {
        fileSystem = new MemoryFileSystem()
        fileSystem.mkdirpSync(rootPath)
        fileSystem.writeFileSync(filePath, "Hello World")

        explorerFileSystem = new MockedFileSystem(
            new ExplorerFileSystem.FileSystem(fileSystem as any),
        )
        store = ExplorerState.createStore(explorerFileSystem)
    })

    describe("SET_ROOT_DIRECTORY", () => {
        it("expands directory automatically", async () => {
            store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath,
            })

            await TestHelpers.waitForAllAsyncOperations()
            TestHelpers.tick(0) // execute setImmediate of memory-fs callbacks
            await Promise.all(explorerFileSystem.promises)

            const state = store.getState()

            assert.deepEqual(
                state.expandedFolders[rootPath],
                [{ type: "file", fullPath: filePath }],
                "Validate expanded folders is set",
            )
        })
    })
})
