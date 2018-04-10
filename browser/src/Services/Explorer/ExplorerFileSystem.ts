/**
 * ExplorerFileSystem.ts
 *
 * State management for the explorer split
 */

import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

import { FolderOrFile } from "./ExplorerStore"

/**
 * An abstraction of the node filesystem APIs to enable testing
 */
export interface IFileSystem {
    readdir(fullPath: string): Promise<FolderOrFile[]>
    exists(fullPath: string): Promise<boolean>
}

export class FileSystem implements IFileSystem {
    private _fs: {
        readdir(path: string): Promise<string[]>
        stat(path: string): Promise<fs.Stats>
        exists(path: string): Promise<boolean>
    }

    constructor(nfs: typeof fs) {
        this._fs = {
            readdir: promisify(nfs.readdir.bind(nfs)),
            stat: promisify(nfs.stat.bind(nfs)),
            exists: promisify(nfs.exists.bind(nfs)),
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
}
