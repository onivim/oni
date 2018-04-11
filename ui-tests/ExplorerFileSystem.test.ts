import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { mkdir, rm } from "shelljs"
import { promisify } from "util"

import { isCiBuild } from "./utility"

const rmdir = promisify(fs.rmdir)
const stat = promisify(fs.stat)

import { OniFileSystem as fileSystem } from "./../browser/src/Services/Explorer/ExplorerFileSystem"

describe("File System tests", () => {
    let rootPath: string
    let filePath: string
    let secondPath: string
    beforeAll(() => {
        rootPath = path.normalize(path.join(os.tmpdir(), "a", "test", "dir"))
        filePath = path.join(rootPath, "file.txt")
        secondPath = path.join(rootPath, "file1.txt")
        mkdir("-p", rootPath)
    })

    beforeEach(() => {
        fs.writeFileSync(filePath, "Hello World")
        fs.writeFileSync(secondPath, "file1.txt")
    })

    afterAll(async () => {
        if (isCiBuild) {
            // Do not delete the backup dir for developers
            await rmdir(fileSystem.backupDir)
        }
        await rmdir(rootPath)
    })

    it("Should return false is the file is too big to persist", async () => {
        const canPersist = await fileSystem.canPersistNode(filePath, 1)
        expect(canPersist).toBeFalsy()
    })
    it("Should return true is the file can be persisted", async () => {
        const canPersist = await fileSystem.canPersistNode(filePath, 1000)
        expect(canPersist).toBeTruthy()
    })
    it("Should delete the file", async () => {
        fileSystem.deleteNode({
            filePath: secondPath,
            id: "2",
            type: "file",
            modified: false,
            name: "file1",
            indentationLevel: 2,
        })
        expect(() => fs.statSync(secondPath)).toThrow(/ENOENT/)
    })

    it("Should persist the file", async () => {
        fileSystem.persistNode(secondPath)
        const stats = await stat(path.join(fileSystem.backupDir, "file1.txt"))
        expect(stats.isFile()).toBeTruthy()
    })

    it("Should move a collection of files to the correct directory", async () => {
        const { backupDir: folder } = fileSystem
        const nodes = [{ file: filePath, folder }, { file: secondPath, folder }]
        fileSystem.moveNodes(nodes)
        const firstStats = stat(path.join(folder, "file1.txt"))
        const secondStats = stat(path.join(folder, "file1.txt"))
        expect(firstStats).toBeTruthy
        expect(secondStats).toBeTruthy
    })
})
