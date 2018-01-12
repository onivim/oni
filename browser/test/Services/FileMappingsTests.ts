import * as assert from "assert"
// import * as fs from "fs"

import * as path from "path"

const MemoryFileSystem = require("memory-fs")

import * as FileMappings from "./../../src/Services/FileMappings"
// import * as TestHelpers from "./../TestHelpers"

describe("FileMappings", () => {

    let rootPath: string
    let srcPath: string
    let testPath: string
    let fileSystem: any

    beforeEach(() => {
        
            rootPath = path.join("C:/", "oni-unit-test-container")
            srcPath = path.join(rootPath, "browser", "src")
            testPath = path.join(rootPath, "browser", "test")

            fileSystem = new MemoryFileSystem()
            fileSystem.mkdirpSync(srcPath)
          fileSystem.mkdirpSync(testPath)
    })

    describe("getMappedFile", () => {
        it("returns null if no mapped file exists", () => {
            const srcFile = path.join(srcPath, "source.ts")
            fileSystem.writeFileSync(srcFile, " ")

            const mapping: FileMappings.IFileMapping = {
                sourceFolder: "browser/src",

                mappedFolder: "browser/test",
                mappedFileName: "${fileName}Test.${ext}",
            }

            const mappedFile = FileMappings.getMappedFile(rootPath, srcFile, mapping)
            assert.strictEqual(mappedFile, null, "Validate mapping returned null since there was no test file")
        })

        it("returns simple mapping", () => {

            const srcFile = path.join(srcPath, "source.ts")
            const testFile = path.join(testPath, "sourceTest.ts")

            fileSystem.writeFileSync(srcFile, " ")
            fileSystem.writeFileSync(testFile, " ")

            const mapping: FileMappings.IFileMapping = {
                sourceFolder: "browser/src",

                mappedFolder: "browser/test",
                mappedFileName: "${fileName}Test.${ext}",
            }

            const mappedFile = FileMappings.getMappedFile(rootPath, srcFile, mapping)
            assert.strictEqual(mappedFile, testFile, "Validate mapping worked correctly")
        })

        it("works with recursive directories", () => {
            const nestedSrcFolder = path.join(srcPath, "nested", "a")
            const nestedTestFolder = path.join(testPath, "nested", "a")

            fileSystem.mkdirpSync(nestedSrcFolder)
            fileSystem.mkdirpSync(nestedTestFolder)

            const srcFile = path.join(nestedSrcFolder, "source.ts")
            const testFile = path.join(nestedTestFolder, "sourceTest.ts")

            fileSystem.writeFileSync(srcFile, " ")
            fileSystem.writeFileSync(testFile, " ")

            const mapping: FileMappings.IFileMapping = {
                sourceFolder: "browser/src",

                mappedFolder: "browser/test",
                mappedFileName: "${fileName}Test.${ext}",
            }

            const mappedFile = FileMappings.getMappedFile(rootPath, srcFile, mapping)
            assert.strictEqual(mappedFile, testFile, "Validate mapping worked correctly")
        })
    })
})
