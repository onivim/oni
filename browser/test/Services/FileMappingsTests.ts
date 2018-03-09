import * as assert from "assert"

import * as path from "path"

const MemoryFileSystem = require("memory-fs") // tslint:disable-line

import * as FileMappings from "./../../src/Services/FileMappings"

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
        it("returns null for template file if template file doesn't exist", () => {
            const srcFile = path.join(srcPath, "source.ts")

            const mapping: FileMappings.IFileMapping = {
                sourceFolder: "browser/src",

                mappedFolder: "browser/test",
                mappedFileName: "${fileName}Test.ts", // tslint:disable-line
            }

            const mappedFile = FileMappings.getMappedFile(rootPath, srcFile, [mapping])

            assert.strictEqual(
                mappedFile.templateFileFullPath,
                null,
                "`templateFileFullPath` should be null since there is no template file specified.",
            )
        })

        it("returns a template file if template file exists", () => {
            const srcFile = path.join(srcPath, "source.ts")

            const mapping: FileMappings.IFileMapping = {
                sourceFolder: "browser/src",

                mappedFolder: "browser/test",
                mappedFileName: "${fileName}Test.ts", // tslint:disable-line

                templateFilePath: "templates/template.ts",
            }

            const mappedFile = FileMappings.getMappedFile(rootPath, srcFile, [mapping])

            assert.strictEqual(
                mappedFile.templateFileFullPath,
                path.join(rootPath, mapping.templateFilePath),
            )
        })
    })

    describe("getMappedFileFromMapping", () => {
        it("returns simple mapping", () => {
            const srcFile = path.join(srcPath, "source.ts")
            const testFile = path.join(testPath, "sourceTest.ts")

            fileSystem.writeFileSync(srcFile, " ")
            fileSystem.writeFileSync(testFile, " ")

            const mapping: FileMappings.IFileMapping = {
                sourceFolder: "browser/src",

                mappedFolder: "browser/test",
                mappedFileName: "${fileName}Test.ts", // tslint:disable-line
            }

            const mappedFile = FileMappings.getMappedFileFromMapping(rootPath, srcFile, mapping)
            assert.strictEqual(mappedFile, testFile, "Validate mapping worked correctly")
        })

        it("works with recursive directories", () => {
            const nestedSrcFolder = path.join(srcPath, "nested", "a")
            const nestedTestFolder = path.join(testPath, "nested", "a")

            fileSystem.mkdirpSync(nestedSrcFolder)
            fileSystem.mkdirpSync(nestedTestFolder)

            const srcFile = path.join(nestedSrcFolder, "source.ts")
            const testFile = path.join(nestedTestFolder, "source.test.ts")

            fileSystem.writeFileSync(srcFile, " ")
            fileSystem.writeFileSync(testFile, " ")

            const mapping: FileMappings.IFileMapping = {
                sourceFolder: "browser/src",

                mappedFolder: "browser/test",
                mappedFileName: "${fileName}.test.ts", // tslint:disable-line
            }

            const mappedFile = FileMappings.getMappedFileFromMapping(rootPath, srcFile, mapping)
            assert.strictEqual(mappedFile, testFile, "Validate mapping worked correctly")
        })
    })

    describe("getPathDifference", () => {
        it("resolves path correctly", () => {
            const diff = FileMappings.getPathDifference("D:/test1/test2", "D:/test1/test2/test3")
            assert.strictEqual(diff, "test3")
        })

        it("resolves path correctly, in reverse", () => {
            const diff = FileMappings.getPathDifference("D:/test1/test2/test3", "D:/test1/test2")
            assert.strictEqual(diff, "test3")
        })

        it("handles case where there is no common path", () => {
            const diff = FileMappings.getPathDifference("D:/test1", "C:/test2")
            assert.strictEqual(diff, path.join("D:", "test1"))
        })
    })
})
