/**
 * Git.ts
 *
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"
import * as GitP from "simple-git/promise"

export type VCSBranchChangedEvent = string

export interface VersionControlProvider {
    // Events
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent
    onBranchChanged: IEvent<VCSBranchChangedEvent>

    getStatus(projectRoot?: string): Promise<GitP.DiffResult | void>
    getRoot(): Promise<string | void>
    getBranch(path?: string): Promise<string | void>
    getLocalBranches(path?: string): Promise<GitP.BranchSummary | string>
    fetchBranchFromRemote(args: {
        branch: string
        origin?: string
        currentDir: string
    }): Promise<GitP.FetchResult>
}

export class GitVersionControlProvider implements VersionControlProvider {
    private _onBranchChange = new Event<VCSBranchChangedEvent>()

    constructor(private _git = GitP) {}

    get onBranchChanged(): IEvent<VCSBranchChangedEvent> {
        return this._onBranchChange
    }

    public async getRoot(): Promise<string | null> {
        try {
            return this._git().revparse(["--show-toplevel"])
        } catch (e) {
            // tslint:disable-next-line
            console.warn(`Git provider unable to find vcs root due to ${e.message}`)
            return null
        }
    }

    public getStatus = async (currentDir: string): Promise<GitP.DiffResult | void> => {
        try {
            const isRepo = await this._git(currentDir).checkIsRepo()
            return isRepo && this._git(currentDir).diffSummary()
        } catch (error) {
            // tslint:disable-next-line
            console.warn(`Git provider unable to get current status because of: ${error.message}`)
        }
    }

    public fetchBranchFromRemote = async ({
        branch,
        remote = "origin",
        currentDir,
    }: {
        branch: string
        remote: string
        currentDir: string
    }) => {
        try {
            const fetched = await this._git(currentDir).fetch(remote, branch)
            return fetched
        } catch (error) {
            // tslint:disable-next-line
            console.warn(`Git provider unable to fetch branch because of: ${error.message}`)
            return null
        }
    }

    public getLocalBranches = (currentDir?: string): Promise<GitP.BranchSummary> => {
        return this._git(currentDir).branchLocal()
    }

    public getBranch = async (currentDir?: string): Promise<string | void> => {
        try {
            const status = await this._git(currentDir).status()
            return status.current
        } catch (e) {
            // tslint:disable-next-line
            console.warn(`Git Provider was unable to get current status because of: ${e.message}`)
        }
    }

    public async changeBranch(targetBranch: string, currentDir: string): Promise<Error | void> {
        try {
            await this._git(currentDir).checkout(targetBranch)
            this._onBranchChange.dispatch(targetBranch)
        } catch (e) {
            return e
        }
    }
}

export const activate = oni => {
    const provider = new GitVersionControlProvider()
    oni.services.vcs.registerProvider({ provider, name: "git" })
    return provider
}
