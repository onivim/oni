/**
 * ExplorerFileSystem.ts
 *
 * State management for the explorer split
 */

import * as fs from "fs"
import { emptyDirSync, ensureDirSync, move, remove } from "fs-extra"
import * as os from "os"
import * as path from "path"
import { promisify } from "util"

import { ExplorerNode } from "./ExplorerSelectors"
import { FolderOrFile } from "./ExplorerStore"

/**
 * An abstraction of the node filesystem APIs to enable testing
 */
export interface IFileSystem {
    readdir(fullPath: string): Promise<FolderOrFile[]>
    exists(fullPath: string): Promise<boolean>
    persistNode(fullPath: string): Promise<void>
    restoreNode(fullPath: string): Promise<void>
    deleteNode(node: ExplorerNode): Promise<void>
    canPersistNode(fullPath: string, size: number): Promise<boolean>
    move(source: string, dest: string): Promise<void>
    moveNodesBack(collection: Array<{ source: string; destination: string }>): Promise<void>
}

export class FileSystem implements IFileSystem {
    private _fs: {
        readdir(path: string): Promise<string[]>
        stat(path: string): Promise<fs.Stats>
        exists(path: string): Promise<boolean>
    }

    private _backupDirectory = path.join(os.tmpdir(), "oni_backup")

    public get backupDir(): string {
        return this._backupDirectory
    }

    constructor(nfs: typeof fs, _promisify: typeof promisify = promisify) {
        this._fs = {
            readdir: _promisify(nfs.readdir.bind(nfs)),
            stat: _promisify(nfs.stat.bind(nfs)),
            exists: _promisify(nfs.exists.bind(nfs)),
        }

        this.init()
    }

    public init = () => {
        ensureDirSync(this._backupDirectory)
        emptyDirSync(this._backupDirectory)
    }

    public async readdir(directoryPath: string): Promise<FolderOrFile[]> {
        const files = await this._fs.readdir(directoryPath)

        const filesAndFolders = files.map(async f => {
            const fullPath = path.join(directoryPath, f)
            const stat = await this._fs.stat(fullPath)
            if (stat.isDirectory()) {
                return {
                    type: "folder",
                    fullPath,
                } as FolderOrFile
            } else {
                return {
                    type: "file",
                    fullPath,
                } as FolderOrFile
            }
        })

        return Promise.all(filesAndFolders)
    }

    public exists(fullPath: string): Promise<boolean> {
        return this._fs.exists(fullPath)
    }

    /**
     * Delete a file or Folder
     *
     * @name deleteNode
     * @function
     * @param {ExplorerNode} node The file or folder node
     */
    public deleteNode = async (node: ExplorerNode): Promise<void> => {
        switch (node.type) {
            case "folder":
                await remove(node.folderPath)
                break
            case "file":
                await remove(node.filePath)
                break
            default:
                break
        }
    }

    /**
     * Move a file or folder from the backup dir to its original location
     *
     * @name restoreNode
     * @function
     * @param {string} fileOrFolder The file or folder path
     */
    public restoreNode = async (prevPath: string): Promise<void> => {
        const name = path.basename(prevPath)
        const backupPath = path.join(this._backupDirectory, name)
        await move(backupPath, prevPath)
    }

    public move = async (source: string, dest: string): Promise<void> => {
        return this.areDifferent(source, dest) && move(source, dest)
    }
    /**
     * Saves a file to the tmp directory to persist deleted files
     *
     * @name PersistNode
     * @function
     * @param {string} filename A file or folder path
     */
    public persistNode = async (fileOrFolder: string): Promise<void> => {
        const { size } = await this._fs.stat(fileOrFolder)
        const hasEnoughSpace = os.freemem() > size
        if (hasEnoughSpace) {
            const filename = path.basename(fileOrFolder)
            const newPath = path.join(this._backupDirectory, filename)
            await move(fileOrFolder, newPath, { overwrite: true })
        }
    }

    /**
     * Moves an array of files and folders to their original locations
     *
     * @name moveNodesBack
     * @function
     * @param {Array} collection An array of object with a file/folder and its destination folder
     * @returns {void}
     */
    public moveNodesBack = async (
        collection: Array<{ destination: string; source: string }>,
    ): Promise<void> => {
        await Promise.all(
            collection.map(
                async ({ source, destination }) =>
                    this.areDifferent(source, destination) && move(destination, source),
            ),
        )
    }

    /**
     * canPersistNode
     * Determine based on size whether the directory should be persisted
     */
    public canPersistNode = async (fullPath: string, maxSize: number): Promise<boolean> => {
        const { size } = await this._fs.stat(fullPath)
        return size < maxSize
    }

    private areDifferent = (src: string, dest: string) => src !== dest
}

export const OniFileSystem = new FileSystem(fs)
