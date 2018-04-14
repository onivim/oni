import * as assert from "assert"
import { emptyDir, mkdirp, remove, stat, writeFile } from "fs-extra"
import * as os from "os"
import * as path from "path"

import { FileSystem, OniFileSystem } from "./../../../src/Services/Explorer/ExplorerFileSystem"

describe("File System tests", async () => {
    let rootPath: string
    let filePath: string
    let secondPath: string
    let fileSystem: FileSystem

    before(() => {
        rootPath = path.normalize(path.join(os.tmpdir(), "a", "test", "dir"))
        filePath = path.join(rootPath, "file.txt")
        secondPath = path.join(rootPath, "file1.txt")
        mkdirp(rootPath)
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
        await fileSystem.deleteNode({
            filePath: secondPath,
            id: "2",
            type: "file",
            modified: false,
            name: "file1",
            indentationLevel: 2,
        })
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
})
