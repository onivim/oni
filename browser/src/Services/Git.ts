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
    constructor(private _git: GitP.SimpleGit = GitP()) {}

    public async getVCSRoot(): Promise<string | null> {
        try {
            const rootDir = await this._git.revparse(["--show-toplevel"])
            Log.info(`Git Root Directory is ${rootDir}`)
            return rootDir
        } catch (e) {
            return null
        }
    }

    public async getVCSStatus(projectRoot?: string): Promise<GitP.DiffResult | null> {
        try {
            const isRepo = await this._git.checkIsRepo()
            console.log("this._git().diffSummary(): ", this._git.diffSummary())
            return isRepo ? this._git.diffSummary() : null
        } catch (e) {
            Log.warn(`[Oni.Git.Plugin]: ${e.message}`)
            return null
        }
    }

    public async getBranch(filePath?: string): Promise<string> {
        const options: IExecOptions = {}
        if (filePath) {
            options.cwd = filePath
        }

        // git().branch()
        const result: any = await execPromise("git rev-parse --abbrev-ref HEAD", options)
        return result
    }
}

export default new GitVersionControlProvider()
