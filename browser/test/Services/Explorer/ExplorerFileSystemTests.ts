import * as assert from "assert"
import { emptyDir, mkdirp, pathExists, remove, stat, writeFile } from "fs-extra"
import * as os from "os"
import * as path from "path"

import { FileSystem, OniFileSystem } from "./../../../src/Services/Explorer/ExplorerFileSystem"

describe("File System tests", async () => {
    let rootPath: string
    let filePath: string
    let secondPath: string
    let fileSystem: FileSystem

    before(async () => {
        rootPath = path.normalize(path.join(os.tmpdir(), "a", "test", "dir"))
        filePath = path.join(rootPath, "file.txt")
        secondPath = path.join(rootPath, "file1.txt")
        await mkdirp(rootPath)
        fileSystem = OniFileSystem
    })

    beforeEach(async () => {
        await Promise.all([
            emptyDir(fileSystem.backupDir),
            writeFile(filePath, "hello world"),
            writeFile(secondPath, "file1.txt"),
        ])
    })

    after(async () => {
        await remove(rootPath)
    })

    it("Should return false is the file is too big to persist", async () => {
        const canPersist = await fileSystem.canPersistNode(filePath, 1)
        assert.ok(!canPersist)
    })
    it("Should return true is the file can be persisted", async () => {
        const canPersist = await fileSystem.canPersistNode(filePath, 1000)
        assert.ok(canPersist)
    })
    it("Should delete the file", async () => {
        await fileSystem.deleteNode(secondPath)
        try {
            await stat(secondPath)
        } catch (e) {
            assert.ok(e.message.includes("ENOENT"))
        }
    })

    it("Should persist the file", async () => {
        await fileSystem.persistNode(secondPath)
        const stats = await stat(path.join(fileSystem.backupDir, "file1.txt"))
        assert.ok(stats.isFile())
    })

    it("Should move a collection of files to the correct directory", async () => {
        const locationOne = path.join(fileSystem.backupDir, "file.txt")
        const locationTwo = path.join(fileSystem.backupDir, "file1.txt")
        const nodes = [
            { source: locationOne, destination: filePath },
            { source: locationTwo, destination: secondPath },
        ]
        await fileSystem.moveNodesBack(nodes)
        const firstStats = await stat(locationOne)
        const secondStats = await stat(locationTwo)
        assert.ok(firstStats.isFile())
        assert.ok(secondStats.isFile())
    })

    it("Should create a new file", async () => {
        const newPath = path.join(rootPath, "created.txt")
        await fileSystem.writeFile(newPath)
        const created = await pathExists(newPath)
        assert.ok(created)
    })

    it("Should throw an error if the filepath already exists", async () => {
        try {
            await fileSystem.writeFile(filePath)
        } catch (e) {
            assert.ok(!!e)
            assert.ok(e.message === "This path already exists")
        }
    })

    it("Should create a new folder", async () => {
        const newPath = path.join(rootPath, "new_dir")
        await fileSystem.writeFile(newPath)
        const created = await pathExists(newPath)
        assert.ok(created)
    })

    it("Should throw an error if the folderpath already exists", async () => {
        try {
            await fileSystem.mkdir(rootPath)
        } catch (e) {
            assert.ok(!!e)
            assert.ok(e.message === "This path already exists")
        }
    })
})
