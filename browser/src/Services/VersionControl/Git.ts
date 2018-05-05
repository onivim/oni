/**
 * Git.ts
 *
 * Utilities around Git
 */

import { Event, IEvent } from "oni-types"
import * as GitP from "simple-git/promise"

import * as Log from "./../../Log"
import VersionControlProvider, { VCSBranchChangedEvent } from "./VersionControlProvider"

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
            Log.warn(`Git provider unable to find vcs root due to ${e.message}`)
            return null
        }
    }

    public getVCSStatus = async (currentDir: string): Promise<GitP.DiffResult | void> => {
        try {
            const isRepo = await this._git(currentDir).checkIsRepo()
            return isRepo && this._git(currentDir).diffSummary()
        } catch (error) {
            Log.warn(`Git privider unable to get current status because of: ${error.message}`)
        }
    }

    public getLocalVCSBranches = (currentDir?: string): Promise<GitP.BranchSummary> => {
        return this._git(currentDir).branchLocal()
    }

    public getVCSBranch = async (currentDir?: string): Promise<string | void> => {
        try {
            const status = await this._git(currentDir).status()
            return status.current
        } catch (e) {
            Log.warn(`Git Provider was unable to get current status because of: ${e.message}`)
        }
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
