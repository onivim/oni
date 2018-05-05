/**
 * Git.ts
 *
 * Utilities around Git
 */

import { Event, IEvent } from "oni-types"
import * as GitP from "simple-git/promise"

import * as Log from "./../Log"

type VCSBranchChangedEvent = string
export interface VersionControlProvider {
    // Events
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent
    onBranchChanged: IEvent<VCSBranchChangedEvent>

    // getHistory(filepath: string): Promise<DiffResult | null>
    getVCSStatus(projectRoot?: string): Promise<GitP.DiffResult | null>
    getVCSRoot(): Promise<string | null>
    getVCSBranch(path?: string): Promise<Error | string>
    getLocalVCSBranches(path?: string): Promise<GitP.BranchSummary | string>
}

export class GitVersionControlProvider implements VersionControlProvider {
    private _onBranchChange = new Event<VCSBranchChangedEvent>()
    constructor(private _git = GitP) {}

    get onBranchChanged(): IEvent<VCSBranchChangedEvent> {
        return this._onBranchChange
    }
    public async getVCSRoot(): Promise<string | null> {
        try {
            return this._git().revparse(["--show-toplevel"])
        } catch (e) {
            Log.warn(`unable to find vcs root due to ${e.message}`)
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

    public getLocalVCSBranches(currentDir?: string): Promise<GitP.BranchSummary> {
        return this._git(currentDir).branchLocal()
    }

    public getVCSBranch(currentDir?: string): Promise<string> {
        return this._git(currentDir)
            .status()
            .then((status: GitP.StatusResult) => status.current)
    }

    public async changeVCSBranch(targetBranch: string, currentDir: string): Promise<Error | void> {
        try {
            await this._git(currentDir).checkout(targetBranch)
            this._onBranchChange.dispatch(targetBranch)
        } catch (e) {
            return e
        }
    }
}

export default new GitVersionControlProvider()
