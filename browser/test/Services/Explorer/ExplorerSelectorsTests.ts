/**
 * ExplorerSelectorsTests.ts
 */

import * as assert from "assert"
import * as ExplorerSelectors from "./../../../src/Services/Explorer/ExplorerSelectors"
import * as ExplorerState from "./../../../src/Services/Explorer/ExplorerStore"

const createTestFile = (filePath: string): ExplorerState.IFileState => ({
    type: "file",
    fullPath: filePath,
})

describe("ExplorerSelectors", () => {
    describe("flattenFolderTree", () => {

        it("flattens a single file", () => {

            const file: ExplorerState.IFileState = createTestFile("testPath")

            const result = ExplorerSelectors.flattenFolderTree(file, [], {})

            const expectedResult = [{
                id: "explorer:testPath",
                type: "file",
                filePath: "testPath",
                modified: false,
            }]

            assert.deepEqual(result, expectedResult)
        })

        it("flattens a single folder", () => {
            const folder: ExplorerState.IFolderState = {
                type: "folder",
                fullPath: "folderPath",
            }

            const result = ExplorerSelectors.flattenFolderTree(folder, [], {})

            const expectedResult = [{
                type: "folder",
                id: "explorer:folderPath",
                folderPath: "folderPath",
                expanded: false,
            }]

            assert.deepEqual(result, expectedResult)
        })

        it("flattens a folder with subfiles", () => {
            const folder: ExplorerState.IFolderState = {
                type: "folder",
                fullPath: "folderPath",
            }

            const expandedFolders = {
                "folderPath": [ createTestFile("file1")],
            }

            const result = ExplorerSelectors.flattenFolderTree(folder, [], expandedFolders)

            const expectedResult = [{
                type: "folder",
                id: "explorer:folderPath",
                folderPath: "folderPath",
                expanded: true,
            }, {
                type: "file",
                id: "explorer:file1",
                filePath: "file1",
                modified: false,
            }]

            assert.deepEqual(result, expectedResult)
        })
    })
})
