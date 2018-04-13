/**
 * ExplorerStoreTests.ts
 */

import * as assert from "assert"
import * as path from "path"
import { promisify } from "util"

import { Store } from "redux"
import { MockStoreCreator } from "redux-mock-store"
import { createEpicMiddleware } from "redux-observable"

import * as ExplorerFileSystem from "./../../../src/Services/Explorer/ExplorerFileSystem"
import * as ExplorerState from "./../../../src/Services/Explorer/ExplorerStore"

import * as clone from "lodash/clone"
import * as head from "lodash/head"
import * as TestHelpers from "./../../TestHelpers"

const configureMockStore = require("redux-mock-store") // tslint:disable-line
const epicMiddleware = createEpicMiddleware(ExplorerState.clearYankRegisterEpic)

const MemoryFileSystem = require("memory-fs") // tslint:disable-line
const mockStore: MockStoreCreator<ExplorerState.IExplorerState> = configureMockStore([
    epicMiddleware,
])

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

    public async canPersistNode() {
        return true
    }

    // tslint:disable
    public async restoreNode() {}
    public async persistNode() {}
    public async moveNodesBack() {}
    public async deleteNode() {}
    public async move() {}
    // tslint:enable
}

describe("ExplorerStore", () => {
    let fileSystem: any
    let store: Store<ExplorerState.IExplorerState>
    let explorerFileSystem: MockedFileSystem

    const rootPath = path.normalize(path.join(TestHelpers.getRootDirectory(), "a", "test", "dir"))
    const filePath = path.join(rootPath, "file.txt")
    const target = { filePath, id: "1" }
    const epicStore = mockStore({ ...ExplorerState.DefaultExplorerState })

    beforeEach(() => {
        fileSystem = new MemoryFileSystem()
        fileSystem.mkdirpSync(rootPath)
        fileSystem.writeFileSync(filePath, "Hello World")

        explorerFileSystem = new MockedFileSystem(
            new ExplorerFileSystem.FileSystem(fileSystem as any, promisify),
        )
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
            assert.deepEqual(head(newState), testAction)
        })
        describe("Register Reducer test", () => {
            const { yankRegisterReducer, DefaultExplorerState: { register } } = ExplorerState
            const pasted1 = {
                type: "file",
                filePath: "/test/dir/",
            }

            const deleteAction = {
                type: "DELETE_SUCCESS",
                persist: true,
                path: "/test/dir",
                target: {
                    type: "folder",
                    folderPath: "/test/dir/subdir",
                    id: "2",
                    expanded: false,
                    name: "subdir",
                    indentationLevel: 2,
                },
            } as ExplorerState.IDeleteSuccessAction

            const pasteAction = {
                type: "PASTE",
                path: "/test/dir",
                target: { type: "folder", folderPath: "/test/dir/subdir" },
                pasted: [pasted1],
            } as ExplorerState.IPasteAction

            it("It should add paste items to both the paste and undo registers", () => {
                const newState = yankRegisterReducer(clone(register), pasteAction)
                assert.deepEqual(
                    newState.paste,
                    pasteAction.target,
                    "Paste is set to the node which was the target of the paste action",
                )
                assert.deepEqual(
                    head(newState.undo),
                    pasteAction,
                    "The paste action is saved in the undo queue",
                )
            })

            it("Should remove item from the end of the undo list following undo success", () => {
                const state = { ...register, undo: [pasteAction] }
                const action = { type: "UNDO_SUCCESS" }
                const newState = yankRegisterReducer(state, action)
                assert.ok(!newState.undo.length)
            })

            it("Adds a delete action to the undo register IF it can be persisted)", () => {
                const newState = yankRegisterReducer(clone(register), deleteAction)
                assert.deepEqual(head(newState.undo), deleteAction)
            })

            it("Does NOT Add a delete action to the undo register IF it can't be persisted)", () => {
                const newState = yankRegisterReducer(clone(register), {
                    ...deleteAction,
                    persist: false,
                })
                assert.ok(!newState.undo.length)
            })
        })
    })
})
