/**
 * Git.ts
 *
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"
import * as GitP from "simple-git/promise"

export type VCSBranchChangedEvent = string

interface FileSummary {
    index: string
    path: string
    working_dir: string
}

export interface StatusResult {
    ahead: number
    behind: number
    currentBranch: string
    modified: string[]
    staged: string[]
    conflicted: string[]
    created: string[]
    deleted: string[]
    untracked: string[]
    remoteTrackingBranch: string
}

export interface VersionControlProvider {
    // Events
    // onFileStatusChanged: IEvent
    // onStageFilesChanged: IEvent
    onBranchChanged: IEvent<VCSBranchChangedEvent>

    getStatus(projectRoot?: string): Promise<StatusResult | void>
    getRoot(): Promise<string | void>
    getBranch(path?: string): Promise<string | void>
    getLocalBranches(path?: string): Promise<GitP.BranchSummary | string>
    stageFile(file: string, projectRoot?: string): Promise<void>
    fetchBranchFromRemote(args: {
        branch: string
        origin?: string
        currentDir: string
    }): Promise<GitP.FetchResult>
}

export class GitVersionControlProvider implements VersionControlProvider {
    private _onBranchChange = new Event<VCSBranchChangedEvent>()
    private _log: (...args: any[]) => void

    constructor(private _oni: Oni.Plugin.Api, private _git = GitP) {
        this._log = this._oni.log.warn || console.warn
    }

    get onBranchChanged(): IEvent<VCSBranchChangedEvent> {
        return this._onBranchChange
    }

    public async getRoot(): Promise<string | null> {
        try {
            return this._git().revparse(["--show-toplevel"])
        } catch (e) {
            this._log(`Git provider unable to find vcs root due to ${e.message}`)
            return null
        }
    }

    public getStatus = async (currentDir: string): Promise<StatusResult | void> => {
        try {
            const isRepo = await this._git(currentDir).checkIsRepo()
            if (isRepo) {
                const status = await this._git(currentDir).status()
                return {
                    ahead: status.ahead,
                    behind: status.behind,
                    created: status.created,
                    deleted: status.deleted,
                    currentBranch: status.current,
                    conflicted: status.conflicted,
                    untracked: status.not_added,
                    staged: this._getStaged(status.files),
                    modified: this._getModified(status.files),
                    remoteTrackingBranch: status.tracking,
                }
            }
        } catch (error) {
            this._log(`Git provider unable to get current status because of: ${error.message}`)
        }
    }

    public getDiff = async (currentDir: string): Promise<GitP.DiffResult | void> => {
        try {
            const isRepo = await this._git(currentDir).checkIsRepo()
            return isRepo && this._git(currentDir).diffSummary()
        } catch (error) {
            this._log(`Git provider unable to get current status because of: ${error.message}`)
        }
    }

    public stageFile = async (file: string, dir?: string): Promise<void> => {
        try {
            await this._git(dir).add(file)
        } catch (e) {
            const error = `Git provider unable to add ${file} because ${e.message}`
            this._log(error)
            throw new Error(error)
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
            this._log(`Git provider unable to fetch branch because of: ${error.message}`)
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
            this._log(`Git Provider was unable to get current status because of: ${e.message}`)
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

    private _getModified(files: FileSummary[]): string[] {
        return files.map(({ working_dir, path }) => working_dir === "M" && path).filter(Boolean)
    }

    private _getStaged(files: FileSummary[]): string[] {
        return files.map(({ index, path }) => index === "M" && path).filter(Boolean)
    }
}

export const activate = oni => {
    const provider = new GitVersionControlProvider(oni)
    oni.services.vcs.registerProvider({ provider, name: "git" })
    return provider
}
