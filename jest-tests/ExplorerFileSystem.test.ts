import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { mkdir, rm } from "shelljs"
import { promisify } from "util"

const rmdir = promisify(fs.rmdir)
const stat = promisify(fs.stat)

import { OniFileSystem as Fs } from "./../browser/src/Services/Explorer/ExplorerFileSystem"

describe("File System tests", () => {
    let rootPath: string
    let filePath: string
    let secondPath: string
    beforeAll(() => {
        rootPath = path.normalize(path.join(os.tmpdir(), "a", "test", "dir"))
        filePath = path.join(rootPath, "file.txt")
        secondPath = path.join(rootPath, "file1.txt")
        mkdir("-p", rootPath)
        fs.writeFileSync(filePath, "Hello World")
    })

    beforeEach(() => {
        fs.writeFileSync(secondPath, "file1.txt")
    })

    afterAll(async () => {
        await rmdir(rootPath)
    })

    it("Should return false is the file is too big to persist", () => {
        const canPersist = Fs.canPersistFile(os.homedir(), 1)
        expect(canPersist).toBeFalsy()
    })
    it("Should return true is the file can be persisted", () => {
        const canPersist = Fs.canPersistFile(filePath, 1000)
        expect(canPersist).toBeTruthy()
    })
    it("Should delete the file", async () => {
        Fs.deleteNode({
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
        Fs.persistNode(secondPath)
        const stats = await stat(path.join(Fs.backupDir, "file1.txt"))
        expect(stats.isFile()).toBeTruthy()
    })
})
