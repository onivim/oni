/**
 * ExplorerFileSystem.ts
 *
 * State management for the explorer split
 */

import * as fs from "fs"
import * as path from "path"

import { FolderOrFile } from "./ExplorerStore"
import { FSWatcher } from "./../../Services/FileSystemWatcher"

/**
 * An abstraction of the node filesystem APIs to enable testing
 */
export interface IFileSystem {
    readdir(fullPath: string): Promise<FolderOrFile[]>
}

export class FileSystem implements IFileSystem {
    private _watcher: FSWatcher
    constructor(private _fs: typeof fs) {
        this._watcher = new FSWatcher({ target: "." })
    }

    public readdir(directoryPath: string): Promise<FolderOrFile[]> {
        const files = this._fs.readdirSync(directoryPath)
        this._watcher.onChange.subscribe(filepath => {
            console.log("filepath: ", filepath)
        })

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
}
