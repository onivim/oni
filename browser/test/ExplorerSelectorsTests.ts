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

            const file: ExplorerState.IFileState = createTestFile("/test/files/testFile.txt")

            const result = ExplorerSelectors.flattenFolderTree(file, [], {})

            const expectedResult = [{
                id: "explorer:/test/files/testFile.txt",
                type: "file",
                filePath: "/test/files/testFile.txt",
                name: "testFile.txt",
                modified: false,
            }]

            assert.deepEqual(result, expectedResult)
        })

        it("flattens a single folder", () => {
            const folder: ExplorerState.IFolderState = {
                type: "folder",
                fullPath: "/test/folder/folderPath",
            }

            const result = ExplorerSelectors.flattenFolderTree(folder, [], {})

            const expectedResult = [{
                type: "folder",
                id: "explorer:/test/folder/folderPath",
                folderPath: "/test/folder/folderPath",
                name: "folderPath",
                expanded: false,
            }]

            assert.deepEqual(result, expectedResult)
        })

        it("flattens a folder with subfiles", () => {
            const folder: ExplorerState.IFolderState = {
                type: "folder",
                fullPath: "/test/folder1/folderPath",
            }

            const expandedFolders = {
                "/test/folder1/folderPath": [ createTestFile("/test/files/file1")],
            }

            const result = ExplorerSelectors.flattenFolderTree(folder, [], expandedFolders)

            const expectedResult = [{
                type: "folder",
                id: "explorer:/test/folder1/folderPath",
                folderPath: "/test/folder1/folderPath",
                name: "folderPath",
                expanded: true,
            }, {
                type: "file",
                id: "explorer:/test/files/file1",
                filePath: "/test/files/file1",
                name: "file1",
                modified: false,
            }]

            assert.deepEqual(result, expectedResult)
        })
    })
})
