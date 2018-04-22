/**
 * Git.ts
 *
 * Utilities around Git
 */

import { exec } from "child_process"
import * as GitP from "simple-git/promise"
import { promisify } from "util"
import * as Log from "./../Log"

const execPromise = promisify(exec)

interface IExecOptions {
    cwd?: string
}

export interface VersionControlProvider {
    // Events
    // onBranchChanged: IEvent
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent

    // getHistory(filepath: string): Promise<DiffResult | null>
    getVCSStatus(projectRoot?: string): Promise<GitP.DiffResult | null>
    getBranch(path?: string): Promise<Error | string>
    getVCSRoot(): Promise<string | null>
}

export class GitVersionControlProvider implements VersionControlProvider {
    constructor(private _git = GitP) {}

    public async getVCSRoot(): Promise<string | null> {
        try {
            const rootDir = await this._git().revparse(["--show-toplevel"])
            Log.info(`Git Root Directory is ${rootDir}`)
            return rootDir
        } catch (e) {
            return null
        }
    }

    public async getVCSStatus(currentDir: string): Promise<GitP.DiffResult | null> {
        console.log("this._git: ", this._git)
        console.log("git: ", GitP)

        this._git(currentDir)
            .checkIsRepo()
            .then(isRepo => {
                console.log("ISREPO..........", isRepo)
            })

        return this._git()
            .checkIsRepo()
            .then(isRepo => (isRepo ? this._git(currentDir).diffSummary() : null))
            .catch(error => {
                Log.warn(`[Oni.Git.Plugin]: ${error.message}`)
                return null
            })
    }

    public async getBranch(filePath?: string): Promise<string> {
        const options: IExecOptions = {
            cwd: filePath,
        }

        // git().branch()
        const result: any = await execPromise("git rev-parse --abbrev-ref HEAD", options)
        return result
    }
}

export default new GitVersionControlProvider()
