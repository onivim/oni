/**
 * ExplorerFileSystem.ts
 *
 * State management for the explorer split
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { mkdir, mv, rm, tempdir } from "shelljs"

import { ExplorerNode } from "./ExplorerSelectors"
import { FolderOrFile } from "./ExplorerStore"

import { checkIfPathExists } from "./../../Utility"

/**
 * An abstraction of the node filesystem APIs to enable testing
 */
export interface IFileSystem {
    readdir(fullPath: string): Promise<FolderOrFile[]>
    exists(fullPath: string): Promise<boolean>
}

export class FileSystem implements IFileSystem {
    private _backupDirectory = `${tempdir()}/oni_backup/`
    constructor(private _fs: typeof fs) {
        if (!checkIfPathExists(this._backupDirectory, "folder")) {
            mkdir("-p", this._backupDirectory)
        }
    }

    public readdir(directoryPath: string): Promise<FolderOrFile[]> {
        const files = this._fs.readdirSync(directoryPath)

        const filesAndFolders = files.map(f => {
            const fullPath = path.join(directoryPath, f)
            const stat = this._fs.statSync(fullPath)
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

        return Promise.resolve(filesAndFolders)
    }

    public exists(fullPath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this._fs.exists(fullPath, (exists: boolean) => {
                resolve(exists)
            })
        })
    }

    /**
     * Delete a file or Folder
     *
     * @name deleteFileOrFolder
     * @function
     * @param {ExplorerNode} node The file or folder node
     */
    public deleteFileOrFolder = (node: ExplorerNode) => {
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
     * @name restoreFileOrFolder
     * @function
     * @param {string} fileOrFolder The file or folder path
     */
    public restoreFileOrFolder = (fileOrFolder: string) => {
        const name = path.basename(fileOrFolder)
        const directory = path.dirname(fileOrFolder)
        mv(`${this._backupDirectory}/${name}`, directory)
    }

    /**
     * Saves a file to the tmp directory to persist deleted files
     *
     * @name PersistFile
     * @function
     * @param {string} filename A file or folder path
     */
    public persistFile = async (fileOrFolder: string) => {
        const { size } = fs.statSync(fileOrFolder)
        const hasEnoughSpace = os.freemem() > size
        if (hasEnoughSpace) {
            mv(fileOrFolder, this._backupDirectory)
        }
    }

    /**
     * Moves an array of files and folders
     *
     * @name moveCollection
     * @function
     * @param {Array} collection An array of object with a file and its destination folder
     * @returns {void}
     */
    public moveCollection = (
        collection: Array<{ file: string; folder: string }>,
        destination: ExplorerNode,
    ) => {
        collection.forEach(item => {
            mv(item.file, item.folder)
        })
    }
}

export const OniFileSystem = new FileSystem(fs)
