/**
 * Git.ts
 *
 * Utilities around Git
 */

import { DiffResult } from "simple-git/promise"
import * as Log from "./../Log"

const GitP = require("simple-git") // tslint:disable-line

export interface VersionControlProvider {
    // Events
    // onBranchChanged: IEvent
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent

    // getHistory(filepath: string): Promise<DiffResult | null>
    getVCSStatus(projectRoot?: string): Promise<DiffResult | null>
    getVCSRoot(): Promise<string | null>
    getBranch(path?: string): Promise<Error | string>
}

export class GitVersionControlProvider implements VersionControlProvider {
    private _git: any

    constructor(git = GitP) {
        this._git = git()
    }

    public async getVCSRoot(): Promise<string | null> {
        try {
            const rootDir = await this._git().revparse(["--show-toplevel"])
            Log.info(`Git Root Directory is ${rootDir}`)
            return rootDir
        } catch (e) {
            return null
        }
    }

    public async getVCSStatus(currentDir: string): Promise<DiffResult | null> {
        try {
            console.log("Project......", this._git)
            const isRepo = await this._git.checkIsRepo()
            return isRepo ? this._git.diffSummary() : null
        } catch (error) {
            Log.warn(`[Oni.Git.Plugin]: ${error.message}`)
            return null
        }
    }

    public async getBranches(currentDir?: string): Promise<void> {
        return this._git.branchLocal()
    }

    public async getBranch(currentDir?: string): Promise<string> {
        const status = await this._git.status()
        return (status && status.current) || ""
    }
}

export default new GitVersionControlProvider()
