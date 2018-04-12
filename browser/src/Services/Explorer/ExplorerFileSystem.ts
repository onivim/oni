/**
 * ExplorerFileSystem.ts
 *
 * State management for the explorer split
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { mkdir, mv, rm, tempdir } from "shelljs"
import { promisify } from "util"

import { ExplorerNode } from "./ExplorerSelectors"
import { FolderOrFile } from "./ExplorerStore"

import { checkIfPathExists } from "./../../Utility"

/**
 * An abstraction of the node filesystem APIs to enable testing
 */
export interface IFileSystem {
    readdir(fullPath: string): Promise<FolderOrFile[]>
    exists(fullPath: string): Promise<boolean>
    restoreNode(fullPath: string): void
    persistNode(fullPath: string): void
    moveNodes(collection: Array<{ file: string; folder: string }>): void
}

export class FileSystem implements IFileSystem {
    private _fs: {
        readdir(path: string): Promise<string[]>
        stat(path: string): Promise<fs.Stats>
        exists(path: string): Promise<boolean>
    }
    private _backupDirectory = path.join(tempdir(), "oni_backup")

    public get backupDir(): string {
        return this._backupDirectory
    }

    constructor(nfs: typeof fs, _promisify: typeof promisify = promisify) {
        this._fs = {
            readdir: _promisify(nfs.readdir.bind(nfs)),
            stat: _promisify(nfs.stat.bind(nfs)),
            exists: _promisify(nfs.exists.bind(nfs)),
        }

        if (!checkIfPathExists(this._backupDirectory, "folder")) {
            mkdir("-p", this._backupDirectory)
        }
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
    public deleteNode = (node: ExplorerNode): void => {
        switch (node.type) {
            case "folder":
                rm("-rf", node.folderPath)
                break
            case "file":
                rm(node.filePath)
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
    public restoreNode = (fullPath: string): void => {
        const name = path.basename(fullPath)
        const directory = path.dirname(fullPath)
        mv(path.join(this._backupDirectory, name), directory)
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
            mv(fileOrFolder, this._backupDirectory)
        }
    }

    /**
     * Moves an array of files and folders
     *
     * @name moveNodes
     * @function
     * @param {Array} collection An array of object with a file and its destination folder
     * @returns {void}
     */
    public moveNodes = (collection: Array<{ file: string; folder: string }>): void => {
        collection.forEach(item => {
            mv(item.file, item.folder)
        })
    }

    /**
     * canPersistNode
     * Determine based on size whether the directory should be persisted
     */
    public canPersistNode = async (fullPath: string, maxSize: number): Promise<boolean> => {
        const { size } = await this._fs.stat(fullPath)
        return size < maxSize
    }
}

export const OniFileSystem = new FileSystem(fs)
