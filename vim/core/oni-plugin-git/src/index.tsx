/**
 * Git.ts
 *
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"
import * as GitP from "simple-git/promise"

export type VCSBranchChangedEvent = string
export type VCSStagedFilesChangedEvent = string
export interface VCSFileStatusChangedEvent {
    path: string
    status: "staged"
}
export type Diff = GitP.DiffResult
export type Summary = StatusResult
export type SupportedProviders = "git" | "svn"

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
    onFileStatusChanged: IEvent<VCSFileStatusChangedEvent>
    onStagedFilesChanged: IEvent<VCSStagedFilesChangedEvent>
    onBranchChanged: IEvent<VCSBranchChangedEvent>
    onPluginActivated: IEvent<void>
    onPluginDeactivated: IEvent<void>

    name: SupportedProviders
    isActivated: boolean
    deactivate(): void
    activate(): void
    canHandleWorkspace(dir?: string): Promise<boolean>
    getStatus(): Promise<StatusResult | void>
    getRoot(): Promise<string | void>
    getDiff(): Promise<Diff | void>
    getBranch(): Promise<string | void>
    getLocalBranches(): Promise<GitP.BranchSummary | void>
    changeBranch(branch: string): Promise<void>
    stageFile(file: string, projectRoot?: string): Promise<void>
    fetchBranchFromRemote(args: {
        branch: string
        origin?: string
        currentDir: string
    }): Promise<GitP.FetchResult>
}

export class GitVersionControlProvider implements VersionControlProvider {
    private readonly _name = "git"
    private _onPluginActivated = new Event<void>("Oni::VCSPluginActivated")
    private _onPluginDeactivated = new Event<void>("Oni::VCSPluginDeactivated")
    private _onBranchChange = new Event<VCSBranchChangedEvent>("Oni::VCSBranchChanged")
    private _onStagedFilesChanged = new Event<VCSStagedFilesChangedEvent>(
        "Oni::VCSStagedFilesChanged",
    )
    private _onFileStatusChanged = new Event<VCSFileStatusChangedEvent>(
        "Oni::VCSFilesStatusChanged",
    )
    private _isActivated = false
    private _projectRoot: string

    constructor(private _oni: Oni.Plugin.Api, private _git = GitP) {
        this._oni.workspace.onDirectoryChanged.subscribe(workspace => {
            this._projectRoot = workspace
        })
    }

    get onBranchChanged(): IEvent<VCSBranchChangedEvent> {
        return this._onBranchChange
    }

    get onFileStatusChanged(): IEvent<VCSFileStatusChangedEvent> {
        return this._onFileStatusChanged
    }

    get onStagedFilesChanged(): IEvent<VCSStagedFilesChangedEvent> {
        return this._onStagedFilesChanged
    }

    get onPluginActivated(): IEvent<void> {
        return this._onPluginActivated
    }

    get onPluginDeactivated(): IEvent<void> {
        return this._onPluginDeactivated
    }

    get isActivated(): boolean {
        return this._isActivated
    }

    get name(): SupportedProviders {
        return this._name
    }

    public activate() {
        this._isActivated = true
        this._onPluginActivated.dispatch()
    }

    public deactivate() {
        this._isActivated = false
        this._onPluginDeactivated.dispatch()
    }

    public async canHandleWorkspace(dir?: string): Promise<boolean> {
        try {
            return this._git(this._projectRoot)
                .silent()
                .checkIsRepo()
        } catch (e) {
            this._oni.log.warn(
                `Git provider was unable to check if this directory is a repository because ${
                    e.message
                }`,
            )
            return false
        }
    }

    public async getRoot(): Promise<string | void> {
        try {
            return this._git(this._projectRoot).revparse(["--show-toplevel"])
        } catch (e) {
            this._oni.log.warn(`Git provider unable to find vcs root due to ${e.message}`)
        }
    }

    public getStatus = async (): Promise<StatusResult | void> => {
        try {
            const status = await this._git(this._projectRoot).status()
            const { modified, staged } = this._getModifiedAndStaged(status.files)
            return {
                staged,
                modified,
                ahead: status.ahead,
                behind: status.behind,
                created: status.created,
                deleted: status.deleted,
                currentBranch: status.current,
                conflicted: status.conflicted,
                untracked: status.not_added,
                remoteTrackingBranch: status.tracking,
            }
        } catch (error) {
            this._oni.log.warn(
                `Git provider unable to get current status because of: ${error.message}`,
            )
        }
    }

    public getDiff = async (): Promise<Diff | void> => {
        try {
            return this._git(this._projectRoot).diffSummary()
        } catch (e) {
            const error = `Git provider unable to get current status because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public stageFile = async (file: string, dir?: string): Promise<void> => {
        try {
            await this._git(this._projectRoot).add(file)
            this._onStagedFilesChanged.dispatch(file)
            this._onFileStatusChanged.dispatch({ path: file, status: "staged" })
        } catch (e) {
            const error = `Git provider unable to add ${file} because ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public fetchBranchFromRemote = async ({
        branch,
        currentDir,
        remote = null,
    }: {
        branch: string
        remote: string
        currentDir: string
    }) => {
        try {
            return this._git(this._projectRoot).fetch(remote, branch)
        } catch (e) {
            const error = `Git provider unable to fetch branch because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public getLocalBranches = async (): Promise<GitP.BranchSummary | void> => {
        try {
            return this._git(this._projectRoot).branchLocal()
        } catch (e) {
            const error = `Git provider unable to get local branches because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public getBranch = async (): Promise<string | void> => {
        try {
            const status = await this._git(this._projectRoot).status()
            return status.current
        } catch (e) {
            const error = `Git Provider was unable to get current status because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    public async changeBranch(targetBranch: string): Promise<void> {
        try {
            await this._git(this._projectRoot).checkout(targetBranch)
            this._onBranchChange.dispatch(targetBranch)
        } catch (e) {
            const error = `Git Provider was unable change branch because of: ${e.message}`
            this._oni.log.warn(error)
            throw new Error(error)
        }
    }

    private _isStaged = (file: FileSummary) => {
        const GitPIndicators = ["M", "A"]
        return GitPIndicators.some(status => file.index.includes(status))
    }

    private _getModifiedAndStaged(files: FileSummary[]): { modified: string[]; staged: string[] } {
        return files.reduce(
            (acc, file) => {
                if (file.working_dir === "M") {
                    acc.modified.push(file.path)
                } else if (this._isStaged(file)) {
                    acc.staged.push(file.path)
                }
                return acc
            },
            { modified: [], staged: [] },
        )
    }
}

export const activate = async oni => {
    const provider = new GitVersionControlProvider(oni)
    await oni.services.vcs.registerProvider(provider)

    return provider
}
