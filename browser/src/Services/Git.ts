/**
 * Git.ts
 *
 * Utilities around Git
 */

import * as GitP from "simple-git/promise"
import * as Log from "./../Log"

export interface VersionControlProvider {
    // Events
    // onBranchChanged: IEvent
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent

    // getHistory(filepath: string): Promise<DiffResult | null>
    getVCSStatus(projectRoot?: string): Promise<GitP.DiffResult | null>
    getVCSRoot(): Promise<string | null>
    getBranch(path?: string): Promise<Error | string>
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
        try {
            const isRepo = await this._git(currentDir).checkIsRepo()
            return isRepo ? this._git(currentDir).diffSummary() : null
        } catch (error) {
            Log.warn(`[Oni.Git.Plugin]: ${error.message}`)
            return null
        }
    }

    public async getBranch(currentDir?: string): Promise<string> {
        const status = await this._git(currentDir).status()
        return status.current || ""
    }
}

export default new GitVersionControlProvider()
