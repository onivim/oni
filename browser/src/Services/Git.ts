/**
 * Git.ts
 *
 * Utilities around Git
 */

import * as GitP from "simple-git/promise"
import * as Log from "./../Log"

// const GitP = require("simple-git") // tslint:disable-line

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

    public getVCSStatus(currentDir: string): Promise<GitP.DiffResult | null> {
        return this._git(currentDir)
            .checkIsRepo()
            .then((isRepo: boolean) => isRepo && this._git(currentDir).diffSummary())
            .catch((error: any): null => {
                Log.warn(`[Oni.Git.Plugin]: ${error.message}`)
                return null
            })
    }

    public getBranches(currentDir?: string): Promise<GitP.BranchSummary> {
        return this._git(currentDir).branchLocal()
    }

    public getBranch(currentDir?: string): Promise<string> {
        return this._git(currentDir)
            .status()
            .then((status: any) => {
                return (status && status.current) || ""
            })
    }
}

export default new GitVersionControlProvider()
