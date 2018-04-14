import * as fs from "fs"
import { mkdirp, remove } from "fs-extra"
import * as os from "os"
import * as path from "path"
import * as util from "util"

import { isCiBuild } from "./utility"

const stat = util.promisify(fs.stat)

jest.mock("util")

import { FileSystem } from "./../browser/src/Services/Explorer/ExplorerFileSystem"

describe("File System tests", () => {
    let rootPath: string
    let filePath: string
    let secondPath: string

    const fileSystem = new FileSystem(fs, util.promisify)

    beforeAll(() => {
        rootPath = path.normalize(path.join(os.tmpdir(), "a", "test", "dir"))
        filePath = path.join(rootPath, "file.txt")
        secondPath = path.join(rootPath, "file1.txt")
        mkdirp(rootPath)
    })

    beforeEach(() => {
        fs.writeFileSync(filePath, "Hello World")
        fs.writeFileSync(secondPath, "file1.txt")
    })

    afterAll(async () => {
        if (isCiBuild) {
            // Do not delete the backup dir for developers
            await remove(fileSystem.backupDir)
        }
        await remove(rootPath)
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
        await fileSystem.deleteNode({
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
        await fileSystem.persistNode(secondPath)
        const stats = await stat(path.join(fileSystem.backupDir, "file1.txt"))
        expect(stats.isFile()).toBeTruthy()
    })

    it("Should move a collection of files to the correct directory", async () => {
        const { backupDir } = fileSystem
        const locationOne = path.join(backupDir, "file.txt")
        const locationTwo = path.join(backupDir, "file1.txt")
        const nodes = [
            { source: filePath, destination: locationOne },
            { source: secondPath, destination: locationTwo },
        ]
        await fileSystem.moveNodesBack(nodes)
        const firstStats = stat(locationOne)
        const secondStats = await stat(locationTwo)
        expect(firstStats).toBeTruthy()
        expect(secondStats).toBeTruthy()
    })
})
